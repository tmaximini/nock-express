// JavaScript Document

/*
#####################################
#                                   #
#      jQuery plugins object        #
#                                   #
#####################################
*/
var Plugins = {
	
	init: function(){
	}
	
}


/*
#####################################
#                                   #
#        global functions           #
#                                   #
#####################################
*/
var Functions = {
	
	init: function(){
	}
	
}


/*
#####################################
#                                   #
#         document ready            #
#                                   #
#####################################
*/
$(document).ready(function() {
	
		
	$(".inline").fancybox({
		'hideOnContentClick': true,
		helpers : {
        overlay : {
            css : {
                'background' : 'rgba(0, 0, 0, 0.75)'
            }
        }
    }
	});
		
});

