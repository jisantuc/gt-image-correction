package gtic

import geotrellis.raster._
import geotrellis.raster.render._
import geotrellis.raster.io.geotiff.MultibandGeoTiff
import geotrellis.vector.Extent
import breeze.generic.{UFunc, MappingUFunc}
import breeze.linalg.{DenseVector, tile, DenseMatrix}

import scala.math.{min, max, pow, ceil, Pi}

object Scratch {

  val rgbTiff = MultibandGeoTiff("/opt/gt-image-correction/data/full-combined-landsat-san-fran-wm.tif")

  val gamma = Some(0.8)
  val contrast = Some(30.0)
  val brightness = Some(15)
  val min = 4000
  val max = 15176

  val clamped = rgbTiff.band(0)
    .resample(2048, 2048)
    .map(pixel => ColorCorrect.clampTiff(pixel, min, max))
    .normalize(min, max, 0, 255)
  val adjusted = ColorCorrect.adjustTile(clamped, contrast, gamma, brightness)

}
