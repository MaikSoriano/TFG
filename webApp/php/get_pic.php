<?php
header("Content-Type: image/jpeg");

   $preview_delay = 10000;

   usleep($preview_delay);
   //readfile("pic.jpg");
   readfile("/dev/shm/mjpeg/cam.jpg");
?>
