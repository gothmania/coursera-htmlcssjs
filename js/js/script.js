document.addEventListener("DOMContentLoaded",
    function (event) {
        var isReset = true;

        function reset(event) {
            if (!isReset) {
                document.querySelector("#title").textContent = "DOM manipulation";
                document.querySelector("#content").innerHTML = "";
                document.querySelector("#data").innerHTML = "";
                
                isReset = true;
            }
        }

        function clickIfEnter(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.querySelector("#btnSayHello").click();
            }
        }

        function sayHello(event) {
            var nameStr = document.querySelector("#name").value.trim();
            var message = "";

            if (nameStr === "") {
                message = "<h2>Hello someone!</h2>";
            } else {
                message = "<h2>Hello " + nameStr + "!</h2>";
            }
            document.querySelector("#content")
                .innerHTML = message;

            $ajaxUtils.sendGetRequest("data/data.json",
                function(response) {
                    document.querySelector("#title")
                        .textContent = "Written by " + response.author;

                    var authorInfoStr = "<code>";
                    if (response.isGraduate) {
                        authorInfoStr += "<span class=\"author-graduate\">" + response.author + "</span>";
                    } else {
                        authorInfoStr += "<span class=\"author-notgraduate\">" + response.author + "</span>";
                    }
                    authorInfoStr += " was born in " + response.yob +
                        " in " + response.city + ", " + response.country +
                        " and has attended ";
                    for (var i = 0; i < response.schools.length; i++) {
                        if (i == 0) {
                            authorInfoStr += response.schools[i];
                        } else if (i < response.schools.length - 1) {
                            authorInfoStr += ", " + response.schools[i];
                        } else {
                            authorInfoStr += ", and " + response.schools[i];
                        }
                    }
                    authorInfoStr += ".</code>";
                    document.querySelector("#data").innerHTML = authorInfoStr;
                });
            
            isReset = false;
        }
        
        document.querySelector("#name")
            .addEventListener("input", reset);
        document.querySelector("#name")
            .addEventListener("keypress", clickIfEnter);
        
        document.querySelector("#btnSayHello")
            .addEventListener("click", sayHello);

        document.querySelector(".container")
            .addEventListener("mousemove",
                function (event) {
                    var notiElement = document.querySelector("#notification");

                    if (event.shiftKey === true) {
                        notiElement.className = "info-box";
                        notiElement.textContent = "Mouse moved to (" + event.clientX + ", " + event.clientY + ") while Shift is pressed!";
                    } else {
                        if (notiElement.className === "info-box") {
                            notiElement.className = "info-box-hidden";
                        }
                    }
                }
            );
    }
);

