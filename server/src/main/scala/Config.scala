package gtic

import com.typesafe.config.ConfigFactory

trait Config {
  val config = ConfigFactory.load()
  private val httpConfig = config.getConfig("http")

  val httpHost = httpConfig.getString("interface")
  val httpPort = httpConfig.getInt("port")
}
