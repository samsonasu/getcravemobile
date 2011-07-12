var backHandler = function(b,e) {
    if(b.getText() == "Back" || b.getText() == "Cancel") {
        Ext.getCmp('mainPnl').setActiveItem(1);
    }
}
var rateHandler = function(b,e) {
    if(b.getText() == "Rate") {
        Ext.getCmp('mainPnl').setActiveItem(reviewFormPnl);
    }

    if(b.getText() == "Submit") {
        reviewForm.submit({
            url: '/ratings?mobile=1',
            method: 'post',
            submitDisabled: true,
            waitMsg: 'Saving Data...Please wait.',
            success: function (objForm,httpRequest) {
                var mbox = new Ext.MessageBox({});
                mbox.alert("Record Saved");
            },
            failure: function() {
                console.log('submissionFailed');
            }
        })
    }

}

Crave.show_user_profile = function(user_id) {
  alert('show profile: ' + user_id);
};

Crave.show_menu_item = function(menu_item_id) {
  alert('show menu item: ' + menu_item_id);
};

Crave.show_restaurant = function(restaurant_id) {
  alert('show restaurant:' + restaurant_id);
};