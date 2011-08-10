//this is a better way to build these panels because if everything uses this style the js include order doesn't matter
Crave.buildSettingsPanel = function() {
  Crave.settingsPanel = new Ext.Panel({
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    scroll: 'vertical',
    dockedItems: Crave.create_titlebar({
      items:[{
        text: "Back", 
        ui: 'iback',
        handler: Crave.back_handler
      }]
    }),
    bodyStyle: 'padding: 4px;',
    items: [{
      cls: 'framePanel',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
         cls: 'settingItem header',
         html: '<img src="../images/fb-settings-icon@2x.png"><div class="title">Facebook</div>'
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
          value : 0,
          listeners: {
            afterrender: function() {
              this.actually_rendered = true;
              //i hate ext, why would they fire the change event on the initial load
            },
            change: function(slider, thumb, newValue, oldValue) {
              if (this.actually_rendered) {
                alert('tell the server about this');
              }
            }
          }
        }]
      }]
    },{
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: '<img src="../images/foursquare.png"><div class="title">Foursquare</div>'
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
          value : 0,
          listeners: {
            afterrender: function() {
              this.actually_rendered = true;
              //i hate ext, why would they fire the change event on the initial load
            },
            change: function(slider, thumb, newValue, oldValue) {
              if (this.actually_rendered && newValue === 1) {
                location.href="/auth/foursquare";
              }
            }
          }
        }]
      }]
    },{
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: "<div class='title'>Send Feedback</span><span class='chevrony'></div>",
         listeners: {
          afterrender: function(c){
            c.el.on('click', function(){
              location.href="mailto:info@getcrave.com";
            });
          }
        }
      },{
         cls: 'settingItem header',
         html: "<div class='title'>Terms Of Service</span><span class='chevrony'></div>"
      },{
         cls: 'settingItem header last',
         html: "<div class='title'>Version</span><span class='version'>1.0</div>"
      }]
    },{
      xtype: 'button',
      text: "Sign out",
      style: 'margin-top: .5em; background: white;',
      height: 44,
      width: '100%',
      handler: function() {
        Crave.sign_out();
        Crave.back_stack = [];
        Crave.viewport.setActiveItem(Crave.myProfilePanel);
      }
    }], 
    listeners: {
      activate: function() {
        if (!Crave.settingsPanel.user_loaded) {
          Crave.settingsPanel.setLoading(true);
          Ext.Ajax.request({
            url: '/users/' + Crave.currentUserId() + '.json',
            method: 'GET',
            success: function(response, options) {
              var user = Ext.decode(response.responseText).user;
              Crave.settingsPanel.set_user(user);
              Crave.settingsPanel.setLoading(false);
            }
          })
        }
      }
    }
  });
  
  Crave.settingsPanel.set_user = function(user) {
    var fbValue = 0;
    var fsValue = 0;

    Ext.each(user.authorizations, function(auth) {
      if (auth.provider === 'facebook')
        fbValue = 1;
      else if (auth.provider === 'foursquare')
        fsValue = 1;
    });

    var fbToggle = Ext.getCmp('facebookToggle');
    var fsToggle = Ext.getCmp('foursquareToggle');
    if (fbToggle.rendered) {
      fbToggle.setValue(fbValue);
      fsToggle.setValue(fsValue);
    } else {
      fbToggle.value = fbValue;
      fsToggle.value = fsValue;
    }
    
    Crave.settingsPanel.user_loaded = true;
  }
  
  return Crave.settingsPanel;
}

