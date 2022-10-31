/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

document.getElementById("btnRegister").addEventListener("click", (event) => {
    
    let pass = document.getElementById("password").value;
    let passcf = document.getElementById("passwordConfirmation").value;
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let form = document.getElementById("register-form");
    if (pass.length < 10) {
        createNotification("The password requires at least 10 characters", "notifications-container", false);
    } else if (pass !== passcf) {
        createNotification("The password confirmation does not match", "notifications-container", false);
    } else if (name !== "" && email !== "") {
        event.preventDefault();
        let newUser = {"name": name, "email": email, "password": pass};
        postOrPutJSON('http://localhost:3000/api/register', 'POST', newUser);
        createNotification("Successful registration", "notifications-container", true);
        form.reset();
    }
})