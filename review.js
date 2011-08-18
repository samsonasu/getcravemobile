
Crave.buildRateDishPanel = function() {
    
  var do_submit = function() {
    reviewText.blur();
    TouchBS.wait("Submitting Review...");
    var rating = {
      menu_item_id: Crave.rateDishPanel.current_menu_item.id,
      user_id: Crave.currentUserId(),
      rating: ratingField.getValue(),
      review: reviewText.getValue()
    };
    
    var jsonData = {
      menu_item_rating: rating
    };
    var query = [];
    if (share_facebook.pressed) {
      jsonData.facebook = 'yes';
    }
    if (share_twitter.pressed) {
      jsonData.twitter = 'yes';
    }
    if (share_foursquare.pressed) {
      jsonData.foursquare = 'yes';
    }
    Ext.Ajax.request({
      url: '/ratings.json?' + query.join('&'),
      method: "POST",
      jsonData: jsonData,
      failure: TouchBS.handle_failure,
      success: function(response, options) {
        TouchBS.stop_waiting();
        reviewText.setValue("");
        Crave.rateDishPanel.clear_stars();
        Crave.rateDishPanel.setActiveItem(labelsPanel);
      }
    });
  }
  
  var reviewText = new Ext.form.TextArea({
    name: 'menu_item_rating[review]',
    anchor: '100%',
    height: 114,
    placeHolder: 'How was it?',
    cls:'reviewField',
    autoCapitalize: true
  });
  var ratingField = new Ext.form.Hidden({
    xtype: 'hiddenfield',
    name: 'menu_item_rating[rating]',
    id:'menuRating'
  });
  var reviewForm = new Ext.form.FormPanel({
    url: '/ratings.json',
    width: '100%',
    items: [ratingField,reviewText],
    listeners: {
      beforesubmit: function() {
        do_submit();
        return false;
      }
    }
  });
  
  var make_share_button = function(network) {
    return new Ext.Button({
      pressed: false, 
      cls: network + 'Share shareButton',
      height: 32,
      width: 51,
      handler: function(c) {
        this.setPressed(!this.pressed);
      },
      setPressed: function(pressed) {
        this.pressed = pressed;
        if (this.pressed) {
          this.el.addCls('x-button-pressed');
        } else {
          this.el.removeCls('x-button-pressed');
        }
      },
      determinePressed: function() {
        var display = false;
        Ext.each(Crave.current_user.authorizations, function(auth) {
          if (auth.provider === network) {
            display = true
          }
        });
        this.setPressed(!!Crave.current_user['auto_post_to_' + network]);
        if (display) {
          this.show();
        } else {
          this.hide();
        }
      }
    });
  }
  
  
  var share_facebook = make_share_button('facebook');
  var share_twitter = make_share_button('twitter');
  var share_foursquare = make_share_button('foursquare');
  
  var sharePanel = new Ext.Panel({
    height: 40,
    cls: 'reviewSharePanel',
    items: [share_foursquare, share_twitter, share_facebook, {
      xtype: 'panel', 
      flex: 1,
      html: "<span>Share on...</span>"
    }]
  });


  var reviewPanel = new Ext.Panel({
    cls: "rateDishPanel",
    height: '100%',
    dockedItems:[Crave.create_titlebar({
      items:[{
        text:'Back',
        ui:'iback',
        handler: function() {
          reviewText.setValue("");
          Crave.rateDishPanel.clear_stars();
          Crave.back_handler();
        }
      },{
        text:'Submit',
        ui:'normal',
        handler:do_submit
      }]
    })],
    items: [{
      html: '<div class="newReviewContainer"><div class="starLabel">Have you tried this?</div><div class="starRating ratingOf0"><button class="starcover" id="id-star1"></button><button class="starcover" id="id-star2"></button><button class="starcover" id="id-star3"></button><button class="starcover" id="id-star4"></button><button class="starcover" id="id-star5"></button></div></div>',
      width:'100%'
    }, reviewForm, 
    sharePanel,{
      xtype: 'panel', 
      bodyStyle: 'padding: 8px;',
      items: {
        xtype: 'button', 
        text: "Submit Review", 
        cls: 'submitButton',
        handler: function() {
          do_submit();
        }
      }
    }
  ]
  });

  var thanks_callback = function() {
    Ext.Msg.alert("It's Been Craved!", 'Thanks for your review');
    Crave.back_handler();
    Crave.show_menu_item(Crave.rateDishPanel.current_menu_item.id); //reload
  }

  var labelsPanel = Crave.buildAddLabelPanel({
    cancel_label: "Skip",
    success_callback: thanks_callback,
    cancel_callback: thanks_callback
  });

  Crave.rateDishPanel = new Ext.Panel({
    layout: 'card',
    activeItem: 0,
    items: [reviewPanel, labelsPanel],
    set_menu_item: function(menu_item) {
      Crave.rateDishPanel.current_menu_item = menu_item;
      labelsPanel.set_menu_item(menu_item);
      reviewText.setValue("");
      Crave.rateDishPanel.setActiveItem(reviewPanel);
      if (Crave.current_user) {
        share_facebook.determinePressed();
        share_twitter.determinePressed();
        share_foursquare.determinePressed();
      }
    },
    clear_stars: function() {
      var ratingClasses = new Array("ratingOf0","ratingOf1", "ratingOf2","ratingOf3","ratingOf4","ratingOf5");
      for(var i=0;i<ratingClasses.length;i++) {
        $(".starRating").removeClass(ratingClasses[i].toString());
      }
      $(".starRating").addClass('ratingOf0');
    },
    listeners: {
      activate: function() {
        if (!Crave.isLoggedIn()) {
          Crave.viewport.setActiveItem(Crave.myProfilePanel);
        }
      }
    }
  });
  
  return Crave.rateDishPanel;
}

$(".starcover").live("click",function(event) {
  var rating = event.currentTarget.id.toString().replace("id-star","");
  Crave.rateDishPanel.clear_stars();
  if(rating==1) {
    $(".starRating").addClass("ratingOf1");
  }
  if(rating==2) {
    $(".starRating").addClass("ratingOf2");
  }
  if(rating==3) {
    $(".starRating").addClass("ratingOf3");
  }
  if(rating==4) {
    $(".starRating").addClass("ratingOf4");
  }
  if(rating==5) {
    $(".starRating").addClass("ratingOf5");
  }
  Ext.getCmp("menuRating").setValue(rating);
});