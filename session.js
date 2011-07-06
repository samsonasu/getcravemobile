
function justLoggedIn() {
    myUID = localStorage.getItem("uid");
    if(myUID!="" && myUID!=null) {
        console.log('found');
        console.log('loaded');
    } else {
        console.log('not found');
    }
    // ?get uid from local storage here?
    //have to reach docked bottom bar, change to sign out, display form links
}

function isLoggedIn() {
    myUID = localStorage.getItem("uid");
    if(myUID!="" && myUID!=null) {
        return true;
    } else {
        return false;
    }
}
