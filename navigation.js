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