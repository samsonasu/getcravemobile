
Crave.isLoggedIn = function() {
  var myUID = localStorage.getItem("uid");
  if(myUID!="" && myUID!=null) {
      return true;
  } else {
      return false;
  }
}

Crave.currentUserId = function() {
  return localStorage.getItem("uid");
}

Crave.sign_out = function() {
  localStorage.setItem("uid","");
  Crave.myProfilePanel.displayed_user_id = null;
}

Crave.handle_failure = function() {
  Ext.Msg.alert("Error", "Something went wrong, sorry about that. ")
  console.log("Ajax error:");
  console.log(arguments);

  //you can call this with .createDelegate(someLoadingPanel) and it will stop loading
  if (this.setLoading instanceof Function) {
    this.setLoading(false);
  }
}