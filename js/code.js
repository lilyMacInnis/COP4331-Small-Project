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
	let url = urlBase + '/SearchUsername.' + extension;

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

	let defaultMsg = document.getElementById("default");

	// Clear previous results and errors
	errorMsg.textContent = "";
	resultsDiv.innerHTML = "";
	defaultMsg.style.display = "flex";

	if (searchTerm === "") {
		errorMsg.textContent = "Please enter a name to search.";
		defaultMsg.style.display = "none";
		return;
	}

	// Get userId from localStorage 
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

				if(jsonObject.error && jsonObject.error != ''){
					errorMsg.textContent = jsonObject.error;
					defaultMsg.style.display = "none";
				}

				if(jsonObject.results.length > 0){
					let count = 1;
					jsonObject.results.forEach(contact => {
						defaultMsg.style.display = "none";
						const card = document.createElement("div");
						card.className = "book-card";

						//formats phone number
						let formattedPhoneNum = contact.Phone.toString().replace(/\D/g, '');
						formattedPhoneNum = `(${formattedPhoneNum.slice(0, 3)}) ${formattedPhoneNum.slice(3, 6)}-${formattedPhoneNum.slice(6)}`;

						card.innerHTML = `
							<div class="book-img"></div>
							<div class="contact-name">${contact.FirstName} ${contact.LastName}</div>
							<div class="contact-info">Phone: ${formattedPhoneNum}</div>
							<div class="contact-info">Email: ${contact.Email}</div>
						`;

						if(count % 2 == 0){
							const bookImg = card.querySelector('.book-img');
            				bookImg.style.backgroundImage = 'url("../images/book2.png")';
						};

						// FIXED: Store contact data when clicked and navigate to edit page
						card.addEventListener('click', function() {
							// Store the contact data for editing
							localStorage.setItem('editContactId', contact.ID || contact.id);
							localStorage.setItem('editFirstName', contact.FirstName);
							localStorage.setItem('editLastName', contact.LastName);
							localStorage.setItem('editPhone', contact.Phone);
							localStorage.setItem('editEmail', contact.Email);
							
							// Navigate to update page
							setTimeout(() => {
								window.location.href = 'updateContact.html';
							}, 10);
						});

						count++;

						resultsDiv.appendChild(card);
					});
				}
            }
        }
        xhr.send(jsonPayload);
    } catch(error){
        console.error("Error in search:", error.message);
		errorMsg.textContent = "An error occurred while fetching contacts.";
    }
}
