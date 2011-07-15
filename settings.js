//this is a better way to build these panels because if everything uses this style the js include order doesn't matter
Crave.buildSettingsPanel = function() {
  Crave.settingsPanel = new Ext.Panel({
    scroll: 'vertical',
    items: [{
      layout: 'vbox',
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: '<img src="/images/facebook.png"><span class="title">Facebook</span>'
      },{
        layout: 'hbox',
        cls: 'settingItem',
        items: [{
          flex: 1.5,
          xtype: 'panel',
          html: "Send my reviews to my profile"
        },{
          flex: 1,
          xtype: 'togglefield',
          id: 'facebookToggle',
          name: 'facebook_toggle',
          value : 1,
          listeners: {

          }
        }]
      }]
    },{
      layout: 'vbox',
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: '<img src="/images/foursquare.png"><span class="title">Foursquare</span><span class="chevrony"></span>'
      },{
        layout: 'hbox',
        cls: 'settingItem',
        items: [{
          flex: 1.5,
          xtype: 'panel',
          html: "Receive recommendations when I check in"
        },{
          flex: 1,
          xtype: 'togglefield',
          id: 'foursquareToggle',
          name: 'foursquare_toggle',
          value : 1,
          listeners: {

          }
        }]
      }]
    },{
      layout: 'vbox',
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: "<span class='title'>Send Feedback</span><span class='chevrony'></span>",
         listeners: {
          afterrender: function(c){
            c.el.on('click', function(){
              location.href="mailto:info@getcrave.com";
            });
          }
        }
      },{
         cls: 'settingItem header',
         html: "<span class='title'>Terms Of Service</span><span class='chevrony'></span>"
      },{
         cls: 'settingItem header last',
         html: "<span class='title'>Version</span><span class='version'>1.0</span>"
      }]
    },{
      cls: 'framePanel',
      items: [{
        cls: 'settingItem header last',
        bodyStyle: 'text-align: center',
        html: "<span class='title'>Sign Out</span>"
      }],
      listeners: {
        afterrender: function(c){
          c.el.on('click', function(){
            Crave.sign_out();
            Ext.getCmp('backToProfileButton').hide();
            Ext.getCmp('profileSettingsButton').hide();
            profilePnl.setActiveItem(profileLoginPnl);
          });
        }
      }
    }]
  });
  
  return Crave.settingsPanel;
}

