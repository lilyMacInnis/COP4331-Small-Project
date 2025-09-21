const urlBase = 'http://cop4331projectdomain.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	//let tmp = {login:login,password:password};
	let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
				localStorage.setItem('userId', userId);
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "*User/Password combination incorrect.";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function doLogout()
{
	userId = 0;
	localStorage.setItem('userId', userId);
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// function searchContacts() {
//     const content = document.getElementById("searchText");
//     const selections = content.value.toUpperCase().split(' ');
//     const table = document.getElementById("contacts");
//     const tr = table.getElementsByTagName("tr");// Table Row

//     for (let i = 0; i < tr.length; i++) {
//         const td_fn = tr[i].getElementsByTagName("td")[0];// Table Data: First Name
//         const td_ln = tr[i].getElementsByTagName("td")[1];// Table Data: Last Name

//         if (td_fn && td_ln) {
//             const txtValue_fn = td_fn.textContent || td_fn.innerText;
//             const txtValue_ln = td_ln.textContent || td_ln.innerText;
//             tr[i].style.display = "none";

//             for (selection of selections) {
//                 if (txtValue_fn.toUpperCase().indexOf(selection) > -1) {
//                     tr[i].style.display = "";
//                 }
//                 if (txtValue_ln.toUpperCase().indexOf(selection) > -1) {
//                     tr[i].style.display = "";
//                 }
//             }
//         }
//     }
// }


function doRegister()
{
    userId = 0;

    firstName = document.getElementById("registerfnameInput").value;
    lastName = document.getElementById("registerlnameInput").value;
    let user = document.getElementById("registerUsernameInput").value;
	let password = document.getElementById("registerPasswordInput").value;

    let hash = md5( password );
	
	document.getElementById("signupResult").innerHTML = "";

	checkUserExists(user, function(userExists){
		if(userExists){
			document.getElementById("signupResult").innerHTML = "*User Already Exists";
		} else{
			let tmp = {
				FirstName: firstName,
				LastName: lastName,
				Login: user,
				Password: hash
			};
			let jsonPayload = JSON.stringify( tmp );
			
			let url = urlBase + '/Register.' + extension;

			let xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
			try
			{
				xhr.onreadystatechange = function() 
				{
					if (this.readyState == 4 && this.status == 200) 
					{
						let jsonObject = JSON.parse( xhr.responseText );
						userId = jsonObject.id;
						localStorage.setItem('userId', userId);
				
						document.getElementById("signupResult").innerHTML = "User added";
				
						firstName = jsonObject.firstName;
						lastName = jsonObject.lastName;

						saveCookie();
			
						window.location.href = "contacts.html";
					}
				};
				xhr.send(jsonPayload);
			}
			catch(err)
			{
				document.getElementById("signupResult").innerHTML = err.message;
			}
		}
	});
}

function checkUserExists (user, callback){
	let retVal = false;
	let tmp = {login: user};
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/SearchUsername' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try{
        xhr.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200){
                let jsonObject = JSON.parse(xhr.responseText);

				if(jsonObject.results && jsonObject.results.length > 0){
					retVal = true;
				} else{
					retVal = false;
				}

				callback(retVal);
            }
        }
        xhr.send(jsonPayload);
    } catch(err){
        console.log("Error in searchUser: "+ err.message);
		document.getElementById("signupResult").innerHTML = err.message;
    }

}

function deleteContact(fName, lName, id){
    let tmp = {
        FirstName: fName,
        LastName: lName,
        UserID: id
    };

    let jsonPayload = JSON.stringify(tmp);

    console.log("Contact being deleted: " + jsonPayload);

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try{
        xhr.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200){
                console.log("Deleted");
            }
        }
        xhr.send(jsonPayload);
    } catch(err){
        console.log("Error in delete: "+ err.message);
    }


}

function searchContacts()
{
	const searchTerm = document.getElementById("searchInput").value.trim();
	const errorMsg = document.getElementById("errorMsg");
	const resultsDiv = document.getElementById("results");

	// Clear previous results and errors
	errorMsg.textContent = "";
	resultsDiv.innerHTML = "";

	if (searchTerm.trim() === "") {
		errorMsg.textContent = "Please enter a name to search.";
		return;
	}

	// Example userId (replace with real value from login or localStorage)
	const userId = localStorage.getItem("userId");

	if(userId < 1){
		errorMsg.textContent = "Please log in.";
		window.location.href = 'login.html';
		return;
	}

	const payload = {
		search: searchTerm,
		userId: userId
	};

	let jsonPayload = JSON.stringify(payload);

	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try{
        xhr.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200){
                let jsonObject = JSON.parse( xhr.responseText );

				if(jsonObject.results.length > 0){
					let count = 1;
					jsonObject.results.forEach(contact => {
						const card = document.createElement("div");
						card.className = "book-card";

						card.innerHTML = `
							<div class="book-img"></div>
							<div class="contact-name">${contact.FirstName} ${contact.LastName}</div>
							<div class="contact-info">Phone: ${contact.Phone}</div>
							<div class="contact-info">Email: ${contact.Email}</div>
						`;

						if(count % 2 == 0){
							const bookImg = card.querySelector('.book-img');
            				bookImg.style.backgroundImage = 'url("../images/book2.png")';
						};

						card.addEventListener('click', function() {
							window.location.href = 'updateContact.html';
							//window.location.href = 'updateContact.html?id=' + contact.id;
						});

						count++;

						resultsDiv.appendChild(card);
					});
				} else{
					errorMsg.textContent = "No contacts found.";
				}
            }
        }
        xhr.send(jsonPayload);
    } catch(error){
        console.error("Error in search:", error.message);
		errorMsg.textContent = "An error occurred while fetching contacts.";
    }

	// fetch(url, {
	// method: "POST",
	// headers: {
	// 	"Content-Type": "application/json"
	// },
	// body: JSON.stringify(payload)
	// })
	// .then(response => response.json())
	// .then(data => {
	// if (data.error && data.error !== "") {
	// 	errorMsg.textContent = data.error;
	// } else if (data.results && data.results.length > 0) {
	// 	data.results.forEach(contact => {
	// 	const card = document.createElement("div");
	// 	card.className = "book-card";

	// 	card.innerHTML = `
	// 		<div class="book-img"></div>
	// 		<div class="contact-name">${contact.FirstName} ${contact.LastName}</div>
	// 		<div class="contact-info">Phone: ${contact.Phone}</div>
	// 		<div class="contact-info">Email: ${contact.Email}</div>
	// 	`;

	// 	resultsDiv.appendChild(card);
	// 	});
	// } else {
	// 	errorMsg.textContent = "No contacts found.";
	// }
	// })
	// .catch(error => {
	// console.error("Error:", error);
	// errorMsg.textContent = "An error occurred while fetching contacts.";
	// });
}