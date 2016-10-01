package gtic

import scala.concurrent.{Future, ExecutionContext}

import geotrellis.raster._
import geotrellis.raster.render._
import geotrellis.raster.io.geotiff.MultibandGeoTiff
import geotrellis.vector.Extent

import scala.math.{min, max, exp, pow, ceil, Pi}


object ColorCorrect {

  def clampTiff(z: Int, min: Int, max: Int) = {
    if(isData(z)) {
      if(z > max) {
        max
      } else if(z < min) {
        min
      } else { z }
    }
    else { z }
  }

  def clampColor(c: Int): Int = {
    if (isNoData(c)) {
      c
    } else {
      if (c < 0) { 0 }
      else if (c > 255) { 255 }
      else c
    }
  }

  def adjustBrightness(v: Int, brightness: Option[Int]): Int = {
    brightness match {
      case Some(b) => if (v > 0) { v + b } else { v }
      case _ => v
    }
  }

  def adjustContrast(v: Int, contrast: Option[Double]): Int = {
    contrast match {
      case Some(c) => {
        val contrastFactor = (259 * (c + 255)) / (255 * (259 - c))
        ((contrastFactor * (v - 128)) + 128).toInt
      }
      case _ => v
    }
  }

  def gammaCorrect(v: Int, gamma: Option[Double]): Int = {
    gamma match {
      case Some(g) => {
        val gammaCorrection = 1 / g
        (255 * math.pow(v / 255.0, g)).toInt
      }
      case _ => v
    }
  }

  def adjustSigmoidal(v: Int, contrast: Double, bias: Double, scale: Int): Int = {
    ((1 - 1 / (1 + exp(bias * (contrast - v / scale)))) * scale).toInt
  }

  def adjust(pixel: Int, contrast: Option[Double], gamma: Option[Double], brightness: Option[Int]): Int = {

    if(isData(pixel)) {
      var adjPixel = pixel
      adjPixel = clampColor(adjustBrightness(adjPixel, brightness))
      adjPixel = clampColor(gammaCorrect(adjPixel, gamma))
      adjPixel = clampColor(adjustContrast(adjPixel, contrast))
      adjPixel
    } else {
      pixel
    }
  }

  def adjustTile(t:Tile, contrast: Option[Double], gamma: Option[Double], brightness: Option[Int]): Tile = {
    t.map(pixel => adjust(pixel, contrast, gamma, brightness))
  }

}
