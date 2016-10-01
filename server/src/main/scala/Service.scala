package gtic


import scala.concurrent.{Future, ExecutionContext}

import geotrellis.raster._
import geotrellis.raster.crop._
import geotrellis.raster.render._
import geotrellis.raster.io.geotiff.MultibandGeoTiff
import geotrellis.vector.Extent

import scala.math.{min, max, exp, pow, ceil, Pi}

case class ColorHistogram(histograms: Seq[Seq[Long]])

object ImageService {


  val rgbLandsat = MultibandGeoTiff("/opt/gt-image-correction/data/full-combined-landsat-san-fran-wm.tif")

  val redLandsat = rgbLandsat.band(0)
  val greenLandsat = rgbLandsat.band(1)
  val blueLandsat = rgbLandsat.band(2)

  val rgbSentinel = MultibandGeoTiff("/opt/gt-image-correction/data/full-combined-sentinel-san-fran-wm.tif")
  val redSentinel = rgbSentinel.band(0)
  val greenSentinel = rgbSentinel.band(1)
  val blueSentinel = rgbSentinel.band(2)

  val originShift = 20037508.342789244
  val tileSize = 256
  val initialResolution = 2 * Pi * 6378137 / tileSize

  def getResolution(zoom: Integer) = {
    initialResolution / pow(2, zoom.toDouble)
  }

  def pixelsToMeters(tileX: Integer, tileY: Integer, zoom: Integer):(Double, Double) = {
    val resolution = getResolution(zoom)
    val metersX = tileX * resolution - originShift
    val metersY = tileY * resolution - originShift
    (metersX, metersY)
  }

  def getTileExtent(tileX: Integer, tileY: Integer, zoom: Integer):Extent = {
    val (xMin, yMin) = pixelsToMeters( tileX *  tileSize, tileY * tileSize, zoom )
    val (xMax, yMax) = pixelsToMeters( (tileX + 1) * tileSize, (tileY + 1) * tileSize, zoom )
    Extent(xMin, yMin, xMax, yMax)
  }

  def extractTile(r: Tile, g:GridBounds): Option[Tile] = {
    r.gridBounds.intersects(g) match {
      case true => Some(r.crop(g, Crop.Options(false)))
      case _ => None
    }
  }

  def renderTile(tileLayer: String, x:Int, y:Int, z:Int, imageParams: ImageParams)(implicit ec: ExecutionContext):Future[Option[Png]] = {

    val extent = getTileExtent(x, y, z)

    val (minCol, minRow, maxCol, maxRow) = tileLayer match {
      case "landsat-8" => {
        val (minCol, minRow) = rgbLandsat.rasterExtent.mapToGrid(extent.xmin, extent.ymin)
        val (maxCol, maxRow) = rgbLandsat.rasterExtent.mapToGrid(extent.xmax, extent.ymax)
        (minCol, minRow, maxCol, maxRow)
      }
      case "sentinel-2" => {
        val (minCol, minRow) = rgbSentinel.rasterExtent.mapToGrid(extent.xmin, extent.ymin)
        val (maxCol, maxRow) = rgbSentinel.rasterExtent.mapToGrid(extent.xmax, extent.ymax)
        (minCol, minRow, maxCol, maxRow)
      }
    }

    val tileBounds = GridBounds(minCol, maxRow, maxCol, minRow)


    val (red, green, blue) = tileLayer match {
      case "landsat-8" => {
        val red = extractTile(redLandsat, tileBounds)
        val green = extractTile(greenLandsat, tileBounds)
        val blue = extractTile(blueLandsat, tileBounds)
        (red, green, blue)
      }
      case "sentinel-2" => {
        val red = extractTile(redSentinel, tileBounds)
        val green = extractTile(greenSentinel, tileBounds)
        val blue = extractTile(blueSentinel, tileBounds)
        (red, green, blue)
      }
    }

    val min = imageParams.min
    val max = imageParams.max
    val contrast = imageParams.contrast
    val brightness = imageParams.brightness

    (red, green, blue) match {
      case (Some(r:Tile), Some(g:Tile), Some(b:Tile)) => {
        val redTile = r.resample(256, 256).convert(IntCellType)
          .map(pixel => ColorCorrect.clampTiff(pixel, min, max))
          .normalize(min, max, 0, 255)
        val greenTile = g.resample(256, 256).convert(IntCellType)
          .map(pixel => ColorCorrect.clampTiff(pixel, min, max))
          .normalize(min, max, 0, 255)
        val blueTile = b.resample(256, 256).convert(IntCellType)
          .map(pixel => ColorCorrect.clampTiff(pixel, min, max))
          .normalize(min, max, 0, 255)

        val adjRed = Future {
          ColorCorrect.adjustTile(redTile, contrast, imageParams.redGamma, brightness)
        }
        val adjGreen = Future {
          ColorCorrect.adjustTile(greenTile, contrast, imageParams.greenGamma, brightness)
        }
        val adjBlue = Future {
          ColorCorrect.adjustTile(blueTile, contrast, imageParams.blueGamma, brightness)
        }
        val bands = Future.sequence(Seq(adjRed, adjGreen, adjBlue))

        for {
          r <- adjRed
          g <- adjGreen
          b <- adjBlue
        } yield Some(ArrayMultibandTile(r, g, b).renderPng)
      }
      case _ => Future {
        Some(ArrayMultibandTile(
          ArrayTile.empty(IntCellType, 256, 256),
          ArrayTile.empty(IntCellType, 256, 256),
          ArrayTile.empty(IntCellType, 256, 256)
        ).renderPng)
      }
    }
  }
}
