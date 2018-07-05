$( document ).ready(function() {
  // constants
  var SHOW_CLASS = 'show',
      HIDE_CLASS = 'hide',
      ACTIVE_CLASS = 'active';
  //tab switching
  $( '.tabs' ).on( 'click', 'li a', function(e){
    e.preventDefault();
    document.getElementById('log_warning').style.display='none';
    document.getElementById('reg_warning').style.display='none';
    document.getElementById('flat_form').style.height='272px';
    var $tab = $( this ),
         href = $tab.attr( 'href' );
  
     $( '.active' ).removeClass( ACTIVE_CLASS );
     $tab.addClass( ACTIVE_CLASS );
  
     $( '.show' )
        .removeClass( SHOW_CLASS )
        .addClass( HIDE_CLASS )
        .hide();
    
      $(href)
        .removeClass( HIDE_CLASS )
        .addClass( SHOW_CLASS )
        .hide()
        .fadeIn( 550 );
  });
  // other functions
$('#registrationbutton').click(function () {
  if($("#reg_reference").val()=='')
  {
    alert('Please ask admin for Reference code to register.');
  }
  else if($("#reg_username").val()!=null && $("#reg_password").val()!=null){
        name=$("#reg_username").val();
        pass=$("#reg_password").val();
        reference=$("#reg_reference").val();


        $.post("/register",{name:name,password:pass,reference:reference},function(data){    
              if(data==='done')     
              {
                
                alert('Account Created !');

              }
              else if(data=='user_exists')
              {
                document.getElementById('reg_warning').style.display='block';
                document.getElementById('flat_form').style.height='310px';
              }
        });
  }
  else{
    alert('Please fill in username/password and reference code.');
  }
        
});




    
  




$('#loginbutton').click(function () {
        
        name=$("#log_username").val();
        
        pass=$("#log_password").val();


        $.post("/login",{name:name,password:pass},function(data){    
              if(data==='done')     
              {
                
                $.post( "/main/clear_session_stored_data", function( data ) {
            
                });
                window.location.href="/main/main";

              }
              else if(data=='cannot_find_user')
              {
                document.getElementById('log_warning').style.display='block';
                document.getElementById('flat_form').style.height='270px';
              }
            });
  });




});