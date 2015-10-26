Contacts = new Mongo.Collection("contacts");
Profiles = new Mongo.Collection("profiles");
contactId = "";


 if (Meteor.isServer) {
  Meteor.publish("contacts", function () { //publish all contacts
    return Contacts.find({});
  });
  
  Meteor.publish("profiles", function () { //publish all accounts
	  return Profiles.find({});
  });
  
  Contacts.allow({ //Allows users to update contacts
	  update: function(userId, doc, fields, modifier){
		  return true;
	  }
  });
  
  Profiles.allow({ //Allows users to add accounts
	insert: function (userId, doc) {
      return true;
	},
  });
}

if (Meteor.isClient) {
  Meteor.subscribe("contacts");
  Meteor.subscribe("profiles");
     
  Template.pages.onCreated( function(){
    var self = this;
    self.vars = new ReactiveDict();
	//used to navigate between homeLogin and addContact templates
    self.vars.setDefault("clicked" , true); //clicked = true if user is not adding a new contact, false if not
	
	//used to navigate between homeLogin and contactDetails templates
	self.vars.setDefault("detailed" , true); //detailed = true if user is not viewing contact details, false if not
	
	//used to show if user is logged in
	self.vars.setDefault("loggedIn" , false); //loggedIn = true if user is logged in, false if not
	
	//used to show if user has entered wrong password
	self.vars.setDefault("wrong" , false);  //wrong = true if user entered wrong password, false if not
	
	//used to show if user has clicked login button
	self.vars.setDefault("clickedLogin" , false);  //clickedLogin = true if user clicked login button, false if not
	
	//used to show if user has clicked create button
	self.vars.setDefault("clickedCreate" , false);  //clickedCreate = true if user clicked create button, false if not
	
	//used to show if user has entered an invalid email
	self.vars.setDefault("emailInvalid" , false);  //emailInvalid = true if user entered invalid email, false if not
	
	//used to show if user has entered an email that is being used
	self.vars.setDefault("emailTaken" , false);  //emailTaken = true if user entered email that is in use, false if not
	
	//used to show if user account was created
	self.vars.setDefault("accountCreated" , false);  //accountCreated = true if user account was created, false if not
  });
  
  Template.pages.events({
  "click .addPage":function(event,template){ //Navigate to the addContact page
    var instance = Template.instance();
        instance.vars.set("clicked", false) 
    },
	
  "click .back":function(event,template){ //Navigate to the homeLogin page
    var instance = Template.instance();
        instance.vars.set("clicked", true)	
		instance.vars.set("detailed", true)
		instance.vars.set("clickedLogin", false)
		instance.vars.set("clickedCreate", false)
    },
	
  "click .contact":function(event,template){ //Navigate to the contactDetails page
    var instance = Template.instance();
        instance.vars.set("detailed", false)
		contactId = this._id;
    },
	
	"click .loginButton":function(event,template){ //Navigate to the loginHome page
    var instance = Template.instance();
        instance.vars.set("clickedLogin", true) 
    },
	
	"click .createButton":function(event,template){ //Navigate to the loginCreate page
    var instance = Template.instance();
        instance.vars.set("clickedCreate", true) 
    },
	
	"submit .login-home": function(event, template){ //Log in user or tell user if email is invalid or password is incorrect
	  // Prevent default browser form submit
      event.preventDefault();
	  
	  // Get values for username and password
      var name = event.target.username.value;
	  var password = event.target.password.value;
	  
	  if (Profiles.find({username: name}).fetch({})[0] == undefined){ //Email is not being used		  
		  var instance = Template.instance(); 
		  instance.vars.set("emailInvalid", true); //Email is invalid
	  }
	  else{ //Email is being used
		  if(Profiles.find({username: name}).fetch()[0].password == password){ //Passwords match
			  var instance = Template.instance();  
			  instance.vars.set("loggedIn", true);  //Navigate to homeLogin
		  }
		  else{ //Passwords do not match
		      var instance = Template.instance();  
			  instance.vars.set("wrong", true);  //User entered wrong password
		  }
	  }
	},
	
	"submit .login-create": function(event, template){ //Log in user if account was created.
	  // Prevent default browser form submit
      event.preventDefault();

	  if (profileId != undefined){		  
		  var instance = Template.instance();  
		  instance.vars.set("loggedIn", true);
		  instance.vars.set("clickedCreate", false);
	  }
	},
	
    "submit .new-contact": function (event) { //Navigate back to homeLogin page if contact was created.
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get values for account
      var name = event.target.contactName.value;
	  var email = event.target.contactEmail.value;
	  
	  if(Contacts.find({name: name, email: email, owner: profileId}).fetch({})[0] != undefined){
		var instance = Template.instance();
        instance.vars.set("clicked", true)	
	    instance.vars.set("detailed", true)
	  }
	},
	
	"click .logout":function(event,template){ //Log out user and navigate back to home page
	  profileId = undefined;
      var instance = Template.instance();
      instance.vars.set("loggedIn", false)
    }
  });
  
  Template.pages.helpers({
  clicked: function(){ //return status of clicked
	var instance = Template.instance(); 
	return  instance.vars.get("clicked") 
	},
  detailed: function(){ //return status of detailed
	var instance = Template.instance(); 
	return  instance.vars.get("detailed") 
	},
  details: function (){ //return details of specified contact
	return Contacts.find(contactId).fetch();
	},
  loggedIn: function(){ //return status of loggedIn
	  var instance = Template.instance(); 
	return  instance.vars.get("loggedIn")
  },
  wrong: function(){ //return status of wrong
	  var instance = Template.instance(); 
	return  instance.vars.get("wrong")
  },
  clickedLogin: function(){ //return status of clickedLogin
	  var instance = Template.instance(); 
	return  instance.vars.get("clickedLogin")
  },
  clickedCreate: function(){ //return status of clickedCreate
	  var instance = Template.instance(); 
	return  instance.vars.get("clickedCreate")
  },
  emailInvalid: function(){ //return status of emailInvalid
	  var instance = Template.instance(); 
	return  instance.vars.get("emailInvalid")
  },
  emailTaken: function(){ //return status of emailTaken
	  var instance = Template.instance(); 
	return  instance.vars.get("emailTaken")
  }
  });
  
  Template.loginHome.onCreated( function(){
      var self = this;
      self.vars = new ReactiveDict();
      self.vars.setDefault("loggedIn" , false); 
	  self.vars.setDefault("wrong" , false);  
	  self.vars.setDefault("emailInvalid" , false);  
    });
  
  Template.loginHome.events({
	 "submit .login-home": function(event, template){ //Log in user or tell user if email is invalid or password is incorrect
	  // Prevent default browser form submit
      event.preventDefault();
	  
	  // Get values for username and password
      var name = event.target.username.value;
	  var password = event.target.password.value;
	  
	  if (Profiles.find({username: name}).fetch({})[0] == undefined){ //Email is not being used		  
		  var instance = Template.instance(); 
		  instance.vars.set("emailInvalid", true); //Email is invalid
		  instance.vars.set("wrong", false);
		  event.target.password.value = "";
	  }
	  else{ //Email is being used
		  if(Profiles.find({username: name}).fetch()[0].password == password){ //Passwords match
			  var instance = Template.instance();  
			  instance.vars.set("loggedIn", true);  //Log user in and navigate to homeLogin
			  profileId = name;
		  }
		  else{ //Passwords do not match
		      var instance = Template.instance();  
			  instance.vars.set("wrong", true);  //User entered wrong password
			  instance.vars.set("emailInvalid", false);
			  event.target.password.value = "";
		  }
	  }
	} 
  });
  
  Template.loginHome.helpers({
	loggedIn: function(){ 
	var instance = Template.instance(); 
	return  instance.vars.get("loggedIn")
   },
   wrong: function(){
	  var instance = Template.instance(); 
	return  instance.vars.get("wrong")
  },
  emailInvalid: function(){
	  var instance = Template.instance(); 
	return  instance.vars.get("emailInvalid")
  }
  });
  
  Template.loginCreate.onCreated( function(){
      var self = this;
      self.vars = new ReactiveDict();
      self.vars.setDefault("loggedIn" , false);
	  self.vars.setDefault("emailTaken" , false);  
	  self.vars.setDefault("clickedCreate" , false); 
	  
	  //used to show if an account was created.
	  self.vars.setDefault("accountCreated" , false); //accountCreated = true if user account was created, false if not
    });
  
  Template.loginCreate.events({
	 "submit .login-create": function(event, template){ //Log in user or tell user if email is invalid
	  // Prevent default browser form submit
      event.preventDefault();
	  
	  // Get values for username and password
      var name = event.target.username.value;
	  var password = event.target.password.value;
	   
	  if (Profiles.find({username: name}).fetch({})[0] == undefined){ //Email is not taken		  
		Profiles.insert({ //Add account and log user in
			  username: name,
			  password: password
		  });
		  profileId = name;
	  }
	  else{ //Email is taken
	    event.target.username.value = "";
		event.target.password.value = ""; 
	    var instance = Template.instance();  
		instance.vars.set("emailTaken", true);  //Tell user email is taken	    
	  }
	} 
  });
  
  Template.loginCreate.helpers({
	loggedIn: function(){ 
	var instance = Template.instance(); 
	return  instance.vars.get("loggedIn")
   },
  emailTaken: function(){
	  var instance = Template.instance(); 
	return  instance.vars.get("emailTaken")
  },
  accountCreated: function(){ //return status of accountCreated
	  var instance = Template.instance(); 
	return  instance.vars.get("accountCreated")
  }
  });
  
  Template.homeLogin.onCreated( function(){
    var self = this;
    self.vars = new ReactiveDict();
    self.vars.setDefault("detailed" , true);
	
	//used to show if contact was updated
	self.vars.setDefault("updated" , false); //updated = true if the contact has been updated on the contactDetails page
  });
  
  Template.homeLogin.events({
    "click .contact": function(event,template){ //Go to contact details
		var instance = Template.instance();
        instance.vars.set("detailed", true);
		contactId = this._id;
	},
	
	"click .delete": function () { //Delete contact
      Meteor.call("deleteContact", this._id);
	}
  });
  
  Template.homeLogin.helpers({
    contacts: function () { //Returns all contacts for current user 
        return Contacts.find({owner: profileId}, {sort: {name: 1}});
    },
	details: function (){  
		return Contacts.find({_id: contactId}).fetch();
	},
	loggedIn: function(){
	  return loggedIn;
	},
	profileId: function(){
		return profileId;
	},
	updated: function (){ //return status of updated
	  var instance = Template.instance(); 
	  return  instance.vars.get("updated")
	}
  });
  
  Template.addContact.onCreated( function(){
    var self = this;
    self.vars = new ReactiveDict();
	self.vars.setDefault("clicked" , false);
	self.vars.setDefault("detailed" , true);
	
	//used to show if contact that was submitted is already listed
	self.vars.setDefault("contactInvalid" , false); //contactInvalid = true if there is a contact with the same name and email already listed, false if not
  });
  
  
  Template.addContact.events({
    "submit .new-contact": function (event) { //Add new contact if not already listed 
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get values for contact
      var name = event.target.contactName.value;
	  var phone = event.target.contactPhone.value;
	  var email = event.target.contactEmail.value;
	  var image = event.target.contactImage.value;
	  
	  if(Contacts.find({name: name, email: email, owner: profileId}).fetch({})[0] == undefined){ //Add contact and navigate to homeLogin
		Meteor.call("addContact", name, phone, email, image, profileId);
		var instance = Template.instance();
        instance.vars.set("clicked", true)	
	    instance.vars.set("detailed", true)
	  }
	  
      else{ //Tell user contact is already listed
		event.target.contactName.value = "";
		event.target.contactPhone.value = "";  
		event.target.contactEmail.value = "";
		event.target.contactImage.value = "";  
		var instance = Template.instance();
        instance.vars.set("contactInvalid", true) 
	  }
	}
  });
  
  Template.addContact.helpers({
	contactInvalid: function (){
	  var instance = Template.instance(); 
	  return  instance.vars.get("contactInvalid")
	}
  });
  
  Template.contactDetails.onCreated( function(){
    var self = this;
    self.vars = new ReactiveDict();
	self.vars.setDefault("loggedIn" , false);
	self.vars.setDefault("contactInvalid" , false);
	self.vars.setDefault("updated" , false);
  });
  
  Template.contactDetails.events({
    "submit .contact-details": function (event) { //Updates contact info if contact is not already listed
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get values for contact
      var name = event.target.contactName.value;
	  var phone = event.target.contactPhone.value;
	  var email = event.target.contactEmail.value;
	  var image = event.target.contactImage.value;
	  
	  if(Contacts.find({name: name, email: email, owner: profileId}).fetch({})[0] == undefined){ //Updates contact info
		Contacts.update({_id: contactId}, {
		$set:{ name: name,
			   phone: phone,
			   email: email,
			   image: image,
			   owner: profileId
			}
	    }
	  );
	  var instance = Template.instance();
      instance.vars.set("updated", true)
	  }
	  
      else{ //Tell user contact is already listed
		var instance = Template.instance();
        instance.vars.set("contactInvalid", true) 
	  }
	}
  });
  
  Template.contactDetails.helpers({
	details: function (){
		return Contacts.find(contactId).fetch();
	},
	updated: function (){
	  var instance = Template.instance(); 
	  return  instance.vars.get("updated")
	},
	contactInvalid: function (){ 
	  var instance = Template.instance(); 
	  return  instance.vars.get("contactInvalid")
	}
  });
  
  Template.task.events({ //Delete contact
    "click .delete": function () {
      Meteor.call("deleteContact", this._id);
	}
  });
}

Meteor.methods({
  addContact: function (name, phone, email, image, owner) { //Add contact
    Contacts.insert({
      name: name,
      phone: phone,
	  email: email,
	  image: image,
      owner: owner
    });
  },
  
  addUser: function (name, password) { //Add user
    Profiles.insert({
      username: name,
      password: password
    });
  },
  
  deleteContact: function (taskId) { //Delete contact
    Contacts.remove(taskId);
  },
  
  getDetails: function (taskId){ //Get contact details
	return Contacts.find({_id: taskId}).fetch();
  }
});
