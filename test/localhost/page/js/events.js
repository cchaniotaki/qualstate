// const https = require('https');

window.onload = function () {    
    var btnId = document.getElementById("btnId");
    if (btnId) {
        btnId.addEventListener("click", function() {
            add("pId");
          });
    }

    var btnIdTd1 = document.getElementById("idTd1");
    if (btnIdTd1) {
        btnIdTd1.addEventListener('click', () => {
            add("pIdTd1");
        })
    }

    var btnIdTd2 = document.getElementById("idTd2");
    if (btnIdTd2) {
        btnIdTd2.addEventListener('click', () => {
            add("pIdTd2");
        })
    }

    function add(id) {
        const p = document.getElementById(id);
        let i = parseInt(p.innerHTML);
        if (p.innerHTML < 2) {
            p.innerHTML = i + 1;
        }
    }


    function add(id) {
        const p = document.getElementById(id);
        let i = parseInt(p.innerHTML);
        if (p.innerHTML < 2) {
            p.innerHTML = i + 1;
        }
    }

    var btnReq = document.getElementById("btnReq");
    if (btnReq) {
        btnReq.addEventListener('click', reqInfo);
    }
    async function reqInfo() {
        const pReq = document.getElementById("pReq");
        if (pReq.innerHTML.trim() == "") {
            //     const xhr = new XMLHttpRequest();
            //     xhr.open('GET', 'http://localhost:4001/url');
            //     xhr.onload = function () {
            //         if (xhr.status === 200) {
            //             const data = JSON.parse(xhr.responseText);
            //             for (let index = 0; index < data.length; index++) {
            //                 pReq.innerHTML += " <> " + data[index];
            //             }
            //             const div = document.getElementById("hhtpReq");
            //             div.appendChild(pReq);
            //         } else {
            //             console.error(`Error: ${xhr.status}`);
            //         }
            //     };
            //     xhr.onerror = function () {
            //         console.error('Request error');
            //     };
            //     xhr.send();

            const response = await fetch("http://localhost:3001/url");
            const data = await response.json();
            const pReq = document.getElementById("pReq");

            for (let index = 0; index < data.length; index++) {
                pReq.innerHTML += " <> " + data[index];
            }
            const div = document.getElementById("hhtpReq");
            div.appendChild(pReq);
        }
    }

    var form = document.getElementById("idForm");
    if (form) {
        form.addEventListener('submit', submitForm);
    };

    function submitForm(event) {
        event.preventDefault();

        let name = document.forms["myForm"]["fname"].value;
        if (name == "") {
            const pError = document.getElementById("errorFirstName");
            pError.innerHTML = "First Name invalid";

            return false;
        } else {
            const form = document.getElementById("idForm");
            form.remove();

            var div = document.createElement("div");
            div.setAttribute("id", "divForm");

            var br = document.createElement("br");

            var newForm = document.createElement("form");
            newForm.setAttribute("id", "newForm");

            var firstNameLabel = document.createElement("label");
            firstNameLabel.innerHTML = "First name:";

            var p = document.createElement("p");
            p.setAttribute("id", "errorFirstName");

            var firstNameInput = document.createElement("input");
            firstNameInput.setAttribute("type", "text");
            firstNameInput.setAttribute("id", "newFName");

            var btn = document.createElement("button");
            btn.addEventListener("click", validateNewForm);
            btn.setAttribute("id", "btnSubmitNewForm");
            btn.innerHTML = "Submit";

            newForm.appendChild(firstNameLabel);
            newForm.appendChild(br.cloneNode());
            newForm.appendChild(p);
            newForm.appendChild(br.cloneNode());
            newForm.appendChild(firstNameInput);
            newForm.appendChild(br.cloneNode());
            newForm.appendChild(btn);

            var body = document.getElementsByTagName("body")[0];
            div.appendChild(newForm);
            body.insertBefore(div, body.firstChild);
        }
    }

    function validateNewForm(event) {
        event.preventDefault();
        let name = document.getElementById("newFName").value;
        if (name == "") {
            const pError = document.getElementById("errorFirstName");
            pError.innerHTML = "First Name invalid";

            return false;
        } else {
            const form = document.getElementById("newForm");
            form.remove();

            var p = document.createElement("p");
            p.innerHTML = "Form Submitted";

            const div = document.getElementById("divForm");
            div.appendChild(p);
        }
    }

    const hover = document.getElementById("hoverTest");
    if (hover) {
        hover.addEventListener("mouseenter", hoverP);
    };

    function hoverP() {
        // if (hover.style.color == "purple" || hover.style.color == "black") {
            hover.style.color = "blue";
        // } else {
        //     hover.style.color = "purple";
        // }
    }

    var input = document.getElementById("onChangeInput");
    if (input) {
        input.addEventListener("input", onChangeInput);
    };

    let executedInput = false
    function onChangeInput() {
        if (!executedInput) {
            executedInput = true;
            var div = document.getElementById("onChangeInputDiv");
            const input = document.getElementById("onChangeInput");
            input.dispatchEvent(new Event('input', { 'bubbles': true }));
            input.remove();
            const p = document.getElementById("onChangeInput");
            p.innerHTML = "Input Handle";
            div.appendChild(p);
        }
    }

    var input2 = document.getElementById("onChangeInput2");
    if (input2) {
        input2.addEventListener("input", onChangeInput2);
    };

    let executedInput2 = false
    function onChangeInput2() {
        if (!executedInput2) {
            executedInput2 = true;
            var div = document.getElementById("onChangeInputDiv2");
            const input = document.getElementById("onChangeInput2");
            input.dispatchEvent(new Event('input', { 'bubbles': true }));
            input.remove();
            const p = document.getElementById("onChangeInput2");
            p.innerHTML = "Input Handle";
            div.appendChild(p);
        }
    }
}