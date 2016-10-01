package gtic

import scala.concurrent.ExecutionContext

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.{HttpEntity, MediaTypes}
import akka.http.scaladsl.model.StatusCodes

case class ImageParams(
  redGamma: Option[Double],
  greenGamma: Option[Double],
  blueGamma: Option[Double],
  contrast: Option[Double],
  brightness: Option[Int],
  min: Int,
  max: Int
)

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import spray.json._

object JSONFormats extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val colorHistogramFormat = jsonFormat1(ColorHistogram)
}


/**
  * Contains all routes for Raster Foundry API/Healthcheck endpoints.
  *
  * Actual routes should be written in the relevant feature as much as is feasible
  *
  */
trait Router {

  import JSONFormats._

  implicit val ec: ExecutionContext

  val imageParams = parameters(
    "redGamma".as[Double].?,
    "greenGamma".as[Double].?,
    "blueGamma".as[Double].?,
    "contrast".as[Double].?,
    "brightness".as[Int].?,
    "min".as[Int] ? 0,
    "max".as[Int] ? 20000
  ).as(ImageParams)

  val routes = (
    pathPrefix("tiles" / Segment / IntNumber / IntNumber / IntNumber) { case(tileLayer, zoom, x, y) =>
      pathEndOrSingleSlash {
        imageParams { imageParams =>
          onSuccess(ImageService.renderTile(tileLayer, x, y, zoom, imageParams)) { result =>
            result match {
              case Some(png) => complete(HttpEntity(MediaTypes.`image/png`, png.bytes))
              case _ => complete(StatusCodes.NotFound)
            }
          }
        }
      }
    }
  )
}
