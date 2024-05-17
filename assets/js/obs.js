// Javascript Image Zoom On Click
// Example of use
// <div class="value-img">
//   <img id="img-default" src="img/journey_start_thumbnail.jpg" data-action="zoom" data-original="img/journey_start.jpg"
//     alt="journey_start_thumbnail" />
// </div>

// Listen to images after DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    new Zooming({
      // options...
      customSize: '50%',
      bgOpacity: 0.5,
    }).listen('.img-zoomable')
  })

