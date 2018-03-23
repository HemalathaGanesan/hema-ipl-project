var playersData;
$(document).ready(function() {
  $(document.body).on("click", ".title", function(event) {
    // console.log(this)
    event.stopPropagation();

    if ($(".nav-container").children().length === 0) {
     // console.log($(".nav-container").children().length);
      fetch("/api/getSeason")
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          var d = "";
          data.forEach(e => {
            d += '<li class="seasons" season-id="' + e + '">' + e + "</li>";
          });
          $(".nav-container").append("<ul>" + d + "</ul>");
        });
    }

    $(".seasons").toggle();
  });

  $(document.body).on("click", ".seasons", function(event) {
    // console.log(this)
    event.stopPropagation();
    var thisObj = this;

    var t = $(this).text();

    if ($(this).children().length === 0) {
      fetch("/api/getteam/" + t)
        .then(function(response) {
          return response.json();
        })
        .then(function(val) {
         // console.log(val);
          var s = "";
          val.forEach(n => {
            s += '<li class="teams">' + n + "</li>";
          });
          // console.log(this)
          $(thisObj).append("<ul>" + s + "</ul>");
        });
    }
    $(this).children().toggle();
  });

  $(document.body).on("click", ".teams", function(event) {
    event.stopPropagation();
    var pare = $(this)
      .parent()
      .closest(".seasons")
      .attr("season-id");
    var thisObj = this;
    //console.log(thisObj);
    var c = $(this).text();

    if ($(this).children().length === 0) {
      fetch("/api/getplayer/" + pare + "/" + c)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          playersData = data;
          var a = "";
          for (var key in playersData) {
            a += '<li class="players">' + key + "</li>";
          }
          $(thisObj).append("<ul>" + a + "</ul>");
        });
    }
    $(this).children().toggle();
  });

  $(document.body).on("click", ".players", function(event) {
    event.stopPropagation();
    var thisObj = this;
    // console.log(thisObj)
    var pl = $(this).text();
    // console.log(pl)

    var d = "";

    for (var i in playersData[pl]) {
      d += '<li class="datas">' + i + ":" + playersData[pl][i] + "</li>";
    }
    $(thisObj).append(d);
    $(this).find(".datas").toggle();
  });
});
