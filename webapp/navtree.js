var apiData;
$(document).ready(function() {
  $(document.body).on("click", ".title", function(event) {
    event.stopPropagation();
    if ($(".nav-container").children().length === 0) {
      fetch("/api/season")
        .then(function(response) {
          return response.json();
        })
        .then(function(season) {
          var years = "";
          season.forEach(year => {
            years += `<li class="seasons" season-id=${year}><span class="season-text">${year}</span></li>`;
          });
          $(".nav-container").append(`<ul>${years}</ul>`);
        });
    }
    $(".seasons").toggle();
  });

  $(document.body).on("click", ".seasons", function(event) {
    console.log($(this).children().length);
    event.stopPropagation();
    var thisObj = this;
    var season = $(this).text();

    if ($(this).children().length === 1) {
      fetch("/api/team/" + season)
        .then(function(response) {
          return response.json();
        })
        .then(function(teams) {
          // console.log(val);
          var team_data = "";
          teams.forEach(team => {
            team_data += `<li class="teams" team-id=${team}><span class="team-text">${team}</span></li>`;
          });

          $(thisObj).append(`<ul>${team_data}</ul>`);
        });
    }
    $(this)
      .find(".teams")
      .toggle();
  });

  $(document.body).on("click", ".teams", function(event) {
    event.stopPropagation();
    var season = $(this)
      .parent()
      .closest(".seasons")
      .attr("season-id");
    var thisObj = this;
    console.log(thisObj);
    var team = $(this).text();
    if ($(this).children().length === 1) {
      fetch("/api/player/" + season + "/" + team)
        .then(function(response) {
          console.log(response);
          return response.json();
        })
        .then(function(players) {
          console.log(players);
          apiData = players;
          var play_data = "";
          players.forEach(player => {
            play_data += `<li class="players">${player}</li>`;
          });
          $(thisObj).append(`<ul>${play_data}</ul>`);
        });
    }
    $(this)
      .find(".players")
      .toggle();
  });

  $(document.body).on("click", ".players", function(event) {
    event.stopPropagation();
    var season = $(this)
      .parent()
      .closest(".seasons")
      .attr("season-id");
    var team = $(this)
      .parent()
      .closest(".teams")
      .attr("team-id");
    var thisObj = this;
    var player = $(this).text();
    console.log($(this).children().length);

    if ($(this).children().length === 0) {
      // fetch("/api/players/" + season + "/" + team + "/" + player)
      fetch("/api/players/"+player+"?season="+season)
        .then(function(response) {
          return response.json();
        })
        .then(function(playerdetails) {
          console.log(playerdetails);

          var player_data = `<div class='rowvalue'><div>TotalRun: </div><div>${
            playerdetails.TotalRun
          }</div></div>
                <div class='rowvalue'><div>Average:   </div><div>${
                  playerdetails.Average
                }</div></div>
                <div class='rowvalue'><div>StrikeRate: </div><div>${
                  playerdetails.StrikeRate != "NaN"
                    ? playerdetails.StrikeRate
                    : 0
                }</div></div>
                <div class='rowvalue'><div>Thirites: </div><div>${
                  playerdetails.Thirites
                }</div></div>
                
                <div class='rowvalue'><div>Wickets: </div><div>${
                  playerdetails.Wickets
                }</div></div>
                <div class='rowvalue'><div>Economy: </div><div>${
                  playerdetails.Economy != "NaN" ? playerdetails.Economy : 0
                }</div></div>`;

          $(".player-table").html(
            `<div class='play_data'>${player_data}</div>`
          );
        });
    }
    $(".player-table")
      .children()
      .hide();    
  });
});
