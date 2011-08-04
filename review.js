
Crave.buildRateDishPanel = function() {
  var reviewText = new Ext.form.TextArea({
    name: 'menu_item_rating[review]',
    anchor: '100%',
    height: 400,
    placeHolder: 'Write a review',
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
    items: [ratingField,reviewText]
  });

  var reviewPanel = new Ext.Panel({
    cls: "rateDishPanel",
    dockedItems:[Crave.create_titlebar({
      items:[{
        text:'Back',
        ui:'back',
        handler: function() {
          reviewText.setValue("");
          Crave.rateDishPanel.clear_stars();
          Crave.back_handler();
        }
      },{
        text:'Submit',
        ui:'normal',
        handler:function() {
          reviewText.blur();
          var rating = {
            menu_item_id: Crave.rateDishPanel.current_menu_item.id,
            user_id: Crave.currentUserId(),
            rating: ratingField.getValue(),
            review: reviewText.getValue()
          };
          Ext.Ajax.request({
            url: '/ratings.json',
            method: "POST",
            jsonData: {
              menu_item_rating: rating
            },
            failure: TouchBS.handle_failure,
            success: function(response, options) {
              Crave.rateDishPanel.setActiveItem(labelsPanel);
            }
          });
        }
      }]
    })],
    items: [{
      html: '<div class="newReviewContainer"><div class="starLabel">Have you tried this?</div><div class="starRating ratingOf0"><button class="starcover" id="id-star1"></button><button class="starcover" id="id-star2"></button><button class="starcover" id="id-star3"></button><button class="starcover" id="id-star4"></button><button class="starcover" id="id-star5"></button></div></div>',
      width:'100%'
    }, reviewForm
    ]
  });

  var labelsPanel = Crave.buildAddLabelPanel({
    cancel_label: "Skip",
    success_callback: function() {
      Ext.Msg.alert("It's Been Craved!", 'Thanks for your review');
      Crave.back_handler();
    },
    cancel_callback: function() {
      Ext.Msg.alert("It's Been Craved!", 'Thanks for your review');
      Crave.back_handler();
    }
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