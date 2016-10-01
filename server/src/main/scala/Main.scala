package gtic

import geotrellis.raster.io.geotiff.MultibandGeoTiff

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer

object Main extends App with Router with Config {

  implicit val system = ActorSystem("rf-system")
  implicit val materializer = ActorMaterializer()
  implicit val ec = system.dispatcher

  Http().bindAndHandle(routes, httpHost, httpPort)
}
