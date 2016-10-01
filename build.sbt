name := "gt-image-correction" 

lazy val commonSettings = Seq(
  organization := "notthatbreezy",
  version := "0.1.0",
  scalaVersion := Version.scala,
  scalacOptions := Seq(
    "-deprecation",
    "-feature",
    "-unchecked",
    "-encoding",
    "utf8"
  ),
  resolvers += Resolver.sonatypeRepo("snapshots")
)

lazy val serverSettings = commonSettings ++ Seq(
  fork in run := true,
  connectInput in run := true,
  cancelable in Global := true,
  assemblyJarName in assembly := "image-correction-server.jar",
  assemblyMergeStrategy in assembly := {
    case "reference.conf" => MergeStrategy.concat
    case "application.conf" => MergeStrategy.concat
    case "META-INF/MANIFEST.MF" => MergeStrategy.discard
    case "META-INF\\MANIFEST.MF" => MergeStrategy.discard
    case "META-INF/ECLIPSEF.RSA" => MergeStrategy.discard
    case "META-INF/ECLIPSEF.SF" => MergeStrategy.discard
    case _ => MergeStrategy.first
  },
  resolvers += "Open Source Geospatial Foundation Repo" at "http://download.osgeo.org/webdav/geotools/",
  resolvers += Resolver.bintrayRepo("azavea", "geotrellis"),
  resolvers += Resolver.bintrayRepo("azavea", "maven"),
  test in assembly := {}
)

lazy val loggingDependencies = List(
  Dependencies.slf4j
)

lazy val serverDependencies = loggingDependencies ++ Seq(
  Dependencies.akka,
  Dependencies.akkahttp,
  Dependencies.akkajson,
  Dependencies.akkastream,
  Dependencies.gtRaster,
  Dependencies.breeze,
  Dependencies.breezeNative,
  Dependencies.breezeViz
)

lazy val server = Project("server",
  file("server")).settings(serverSettings:_*).settings {
  libraryDependencies ++= serverDependencies
}
