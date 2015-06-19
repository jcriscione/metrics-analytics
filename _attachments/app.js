'use strict';

//Visualization App
var mainApp = angular.module('visualizationApp', [
  'ui.bootstrap'
],function($locationProvider) {
    $locationProvider.html5Mode({'enabled': true, 'requireBase': false});
})

.controller('vizModel', ['$scope', '$http', '$location',
  function($scope, $http, $location) {
	
	var startDateFilter = null;
	var endDateFilter = null;
	configureDateFilter( function( start, end, label ){
		startDateFilter = start.format('YYYY-MM-DD');
		startDateFilter = end.format('YYYY-MM-DD');
		$scope.selectVisualization();
	});
	
	
	var couchApp = null;
	//Acquire the app
    $.couch.app(function(app) {
    	couchApp = app;
    	
    	$scope.retrieveApps();
    	
    	//Boostrap
    	$scope.selectVisualization();
    });
    
    //Selected application
	$scope.selectedApp = null;
	
	//Contains all the supported visualization
	$scope.visualizations=[
	    {name:"By Events - total", view: "grouped_events", builder: getTotalEventsChartBuilder() },
	    {name:"By Search Category", view: "search_by_categories", builder: getTotalEventsChartBuilder(), width: 1100, height: 700 },
	];
	
	$scope.selectedVisualization=$scope.visualizations[0];
	
    var path = unescape(document.location.pathname).split('/');
    var design = path[3];
    
	$scope.selectVisualization = function(visualization){
		
		//Reset node
		d3.select("#chart").html("");
		
		$scope.selectedVisualization = visualization || $scope.selectedVisualization;
		
		if ( $scope.selectedApp == null ){
			//No app selected, nothing to show
			return;
		}
		
		if ( $scope.selectedVisualization ){
			//Render now
			var builder = $scope.selectedVisualization.builder;
	    	builder.init( "#chart", $scope.selectedVisualization );
	    	couchApp.db.view( design + "/" + $scope.selectedVisualization.view,{
	      		group:true,
	      		startkey:[$scope.selectedApp.key, 0, startDateFilter || 0 ],
	      		endkey:[$scope.selectedApp.key, {}, endDateFilter || {}],
	        	success: function( data ){
	        		builder.renderChart( data.rows );
	        	},
	        	error: function( status, errMessage ){
	        		console.log( "error: " + errMessage );
	        	}
	    	 });
		}
	}
	
	$scope.retrieveApps = function(){
		couchApp.db.view( design + "/grouped_apps",{
			group:true,
			success:function(data){
				$scope.apps = data.rows;
				//Select the first app
				if ( data.rows.length > 0 ){
					$scope.selectApp( data.rows[0] );
				}
				$scope.$apply();
			},
			error: function( status, errMessage ){
				console.log("error: " + errMessage );
			}
		});
	}
	$scope.selectedClass = function( app ){
    	if ( app == $scope.selectedApp){
    		return "active";
    	}
    	return "";
    }
	$scope.selectApp = function(app){
		if ( $scope.selectedApp != app ){
			$scope.selectedApp = app;
			$scope.selectVisualization();
		}
	}
  }]
)