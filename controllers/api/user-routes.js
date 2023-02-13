const router = require("express").Router();// Import the express package and use the Router() method to create a new router object
const { User } = require("../../models");// Import the User model from the models folder

// CREATE new user
router.post("/", async (req, res) => {// post() method to create a new user when the user visits the /api/users endpoint
	try {
		const dbUserData = await User.create({// create() method to create a new user in the database using the data from the request body
			username: req.body.username,// req.body.username is the username from the request body
			email: req.body.email,// req.body.email is the email from the request body
			password: req.body.password,// req.body.password is the password from the request body
		});
		req.session.save(() => {// req.session.save() method to save the session data to the database
			req.session.loggedIn = true;// req.session.loggedIn is set to true
			res.status(200).json(dbUserData);// res.status(200).json(dbUserData) is sent back to the client
		});
	} catch (err) {// If there is an error, the error is logged to the console and the error is sent back to the client
		console.log(err);// Log the error to the console
		res.status(500).json(err);// Send the error to the client as a JSON object with a status code of 500
	}
});

// Login
router.post("/login", async (req, res) => {// login() method to log in a user when the user visits the /api/users/login endpoint
	try {
		const dbUserData = await User.findOne({// findOne() method to find a user in the database using the email from the request body
			where: {
				email: req.body.email,// req.body.email is the email from the request body
			},
		});
		if (!dbUserData) {// If no user is found, an error message is sent back to the client
			res.status(400).json({ message: "Incorrect email or password. Please try again!" });
			return;
		}
		const validPassword = await dbUserData.checkPassword(req.body.password);// dbUserData.checkPassword() from the User model is used to check the password from the request body against the hashed password in the database
		if (!validPassword) {// If the password is incorrect, an error message is sent back to the client
			res.status(400).json({ message: "Incorrect email or password. Please try again!" });
			return;
		}
		req.session.save(() => {// req.session.save() method to save the session data to the database when the loin is successful
			req.session.loggedIn = true;// req.session.loggedIn is set to true
			res.status(200).json({ user: dbUserData, message: "You are now logged in!" });
		});
	} catch (err) {
		console.log(err);// Log the error to the console
		res.status(500).json(err);// Send the error to the client as a JSON object with a status code of 500
	}
});

// Logout
router.post("/logout", (req, res) => {// logout() method to log out a user when the user visits the /api/users/logout endpoint
	if (req.session.loggedIn) {// If the user is logged in, 
		req.session.destroy(() => {// req.session.destroy() method to destroy the session data
			res.status(204).end();// res.status(204).end() is sent back to the client to indicate that the session has been destroyed
		});
	} else {
		res.status(404).end();// If the user is not logged in, res.status(404).end() is sent back to the client to indicate that the session was not found
	}
});

module.exports = router;// Export the router object to be used in the server.js file
