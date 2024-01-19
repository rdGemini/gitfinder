document.getElementById("username").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    fetchUserAndRepositories();
  }
});

let currentPage = 1;
let totalRepositories = 0;
let currentUsername = "";
let perPage = 10;

function fetchUserAndRepositories() {
  const username = $("#username").val();
  perPage = $("#perPage").val() || perPage;

  // Reset currentPage for new requests
  currentPage = 1;

  $("#loader").show();

  // Fetch user details
  $.ajax({
    url: `https://api.github.com/users/${username}`,
    method: "GET",
    success: function (userData) {
      displayUserDetails(userData);
    },
    error: function (xhr, textStatus, errorThrown) {
      console.error("Error fetching user details:", errorThrown);
      $("#loader").hide(); // Hide loader in case of an error
    },
  });

  fetchRepositories();
}

function displayUserDetails(userDetails) {
  const userDetailsDiv = $("#userDetails");
  userDetailsDiv.empty();

  if (userDetails.message === "Not Found") {
    userDetailsDiv.append('<p class="text-muted">User not found.</p>');
    return;
  }

  const userDetailsCard = $('<div class="row"></div>');

  const columnDiv = $('<div class="col-md-3 text-md-right"></div>');
  userDetailsCard.append(columnDiv);
  const column1Div = $('<div class="col-md-3 text-md-right"></div>');

  column1Div.css({
    "text-align": "center",
    "margin-left": "auto",
  });

  column1Div.append(
    `<img src="${userDetails.avatar_url}" alt="User Profile Image" class="img-fluid mb-3" style="border-radius: 50%; max-width: 150px;">`
  );
  column1Div.append(
    `<p><a href="${userDetails.html_url}" target="_blank">${userDetails.html_url}</a></p>`
  );
  userDetailsCard.append(column1Div);

  const column2Div = $('<div class="col-md-6"></div>');
  column2Div.append(`<h3>${userDetails.name || "Not available"}</h3>`);

  if (userDetails.bio) {
    column2Div.append(`<p> ${userDetails.bio}</p>`);
  }

  column2Div.append(
    `<p><strong>📍</strong> ${userDetails.location || "Not available"}</p>`
  );

  if (userDetails.twitter_username) {
    column2Div.append(
      `<p><i>Twitter:</i> <a href="https://twitter.com/${userDetails.twitter_username}" target="_blank">${userDetails.twitter_username}</a></p>`
    );
  }
  if (userDetails.blog) {
    column2Div.append(
      `<p><i>Blog:</i> <a href="${userDetails.blog}" target="_blank">${userDetails.blog}</a></p>`
    );
  }

  userDetailsCard.append(column2Div);
  userDetailsDiv.append(userDetailsCard);
}

function fetchRepositories() {
  const username = $("#username").val();
  perPage = $("#perPage").val() || perPage;

  // Reset currentPage if the username changes
  if (currentUsername !== username) {
    currentPage = 1;
    currentUsername = username;
  }

  $("#loader").show();

  $.ajax({
    url: `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`,
    method: "GET",
    success: function (data) {
      totalRepositories = data.length;
      displayRepositories(data);
      updateButtonStates();
    },
    complete: function () {
      $("#loader").hide();
    },
  });
}

function searchRepositories() {
  const username = $("#username").val();
  const searchRepo = $("#searchRepo").val();
  perPage = $("#perPage").val() || perPage;

  // Reset currentPage for new searches
  currentPage = 1;

  $("#loader").show();

  $.ajax({
    url: `https://api.github.com/search/repositories?q=${searchRepo}+user:${username}&per_page=${perPage}&page=${currentPage}`,
    method: "GET",
    success: function (data) {
      const filteredRepositories = data.items || [];

      totalRepositories = filteredRepositories.length;
      displayRepositories(filteredRepositories);
      updateButtonStates();
    },
    complete: function () {
      $("#loader").hide();
    },
  });
}

function goToPage(direction) {
  if (direction === "prev") {
    currentPage = Math.max(1, currentPage - 1);
  } else if (direction === "next" && totalRepositories > 0) {
    currentPage++;
  }

  fetchRepositories();
}

function updatePageNumber() {
  $("#currentPage").text(`Page ${currentPage}`);
}

function updateButtonStates() {
  $("#prevPageBtn").prop("disabled", currentPage === 1);
  $("#nextPageBtn").prop("disabled", totalRepositories < perPage);
  updatePageNumber();
}

function displayRepositories(repositories) {
  const column1Div = $("#column1");
  const column2Div = $("#column2");
  column1Div.empty();
  column2Div.empty();

  if (repositories.length === 0) {
    column1Div.append("<p> No repositories found.</p>");
    return;
  }

  repositories.forEach((repo, index) => {
    const repoDiv = $('<div class="repository-card"></div>');
    repoDiv.append(`<h3>${repo.name}</h3>`);
    repoDiv.append(`<p>${repo.description || "No description available"}</p>`);

    // Display topics
    if (repo.topics.length > 0) {
      const topicsDiv = $('<div class="mb-2"><strong>Topics : </strong></div>');
      repo.topics.forEach((topic) => {
        topicsDiv.append(`<span class="badge">${topic}</span>`);
      });
      repoDiv.append(topicsDiv);
    }

    // Distribute repositories between columns
    if (index % 2 === 0) {
      column1Div.append(repoDiv);
    } else {
      column2Div.append(repoDiv);
    }
  });
}
