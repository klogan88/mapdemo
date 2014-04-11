require(["dojo/ready", "dojox/geo/openlayers/Map", "dojo/_base/window", "dojox/geo/openlayers/GfxLayer",
         "dojox/geo/openlayers/Layer", "dojox/geo/openlayers/GeometryFeature", "dojox/geo/openlayers/Point", "dojo/_base/declare",
          "dojo/on", "dojo/_base/lang", "dojo/dom-construct", "dojox/geo/openlayers/WidgetFeature", 
          "dojox/charting/widget/Chart", "dojox/charting/widget/Chart2D", "dojox/charting/plot2d/Pie",
          "dojox/charting/themes/PlotKit/blue", "dijit/Dialog", "dijit/form/Button", "dijit/layout/ContentPane",
          "dojox/charting/widget/SelectableLegend", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Highlight",
          "dojox/geo/openlayers/LineString"],
     function(ready, Map, win, GfxLayer, Layer, GeometryFeature, Point, declare, on, 
    		 lang, domConstruct, WidgetFeature, Chart, Chart2D, Pie, blue, Dialog, 
    		 Button, ContentPane, SelectableLable, Tooltip, Highlight, LineString){
	
	var XwtGeometryFeature = declare(GeometryFeature, {
        connect : function(/* event Type */eType,/* Event Handler*/handler){
            var g = this._geometry;
            var keys = Object.keys(g);
            var shp = this.getShape(); 
            on(shp.getEventSource(),eType,lang.hitch(this, handler));
        }
    });
	
	var addPoint = function(coor, fill, bad, lines, layerObj, mapObj)
	{
		var p = new Point({x:coor.x, y:coor.y});
		var f = new XwtGeometryFeature(p);
		f.setFill(fill);
	    f.setStroke([ 0, 0, 0 ]);
	    f.setShapeProperties({
	    	r : 10
		});
		
	    var l = new GfxLayer();
	    console.log(l);
	    layerObj.addFeature(f);
	    mapObj.addLayer(layerObj);
	    
	    f.connect('click', function(e){
	        var div = domConstruct.create("div", {}, win.body());
	        var chart = new Chart2D({margins : {
	            l : 10,
	            r : 10,
	            t : 10,
	            b : 10      }
	        }, div);
	        var c = chart.chart;
	        c.addPlot("default", {type: "Columns", gap: 7, tension: 3});
	        c.addAxis("x", {
	            labels: [{
	                value: 1,
	                text: "Good Calls"},
	            {
	                value: 2,
	                text: "Poor Calls"}]
	        });
	        c.addAxis("y", 
        		{
		        	vertical: true,
		            fixLower: "major",
		            fixUpper: "major",
		            min: 0
	        });
	        
	        if(bad){
	        	c.addSeries(coor.name + " Location 1", [{x:1, y:2000, tooltip: coor.name + " Location 1: " + 2000 + " Calls"}]);
		        c.addSeries(coor.name + " Location 2", [{x:1, y:1000, tooltip: coor.name + " Location 2: " + 1000 + " Calls"}]);
		        c.addSeries(coor.name + " Location 3", [{x:2, y:1500, tooltip: coor.name + " Location 3: " + 1500 + " Calls"}]);
	        } else {
	        	c.addSeries(coor.name + " Location 1", [{x:1, y:2000, tooltip: coor.name + " Location 1: " + 2000 + " Calls"}]);
		        c.addSeries(coor.name + " Location 2", [{x:1, y:1000, tooltip: coor.name + " Location 2: " + 1000 + " Calls"}]);
		        c.addSeries(coor.name + " Location 3", [{x:1, y:1500, tooltip: coor.name + " Location 3: " + 1500 + " Calls"}]);
	        }
	        
	        blue.colors[0].r = 204;
	        blue.colors[0].g = 0;
	        blue.colors[0].b = 0;
	        
	        blue.colors[1].r = 0;
	        blue.colors[1].g = 204;
	        blue.colors[1].b = 0;
	        
	        blue.colors[2].r = 0;
	        blue.colors[2].g = 204;
	        blue.colors[2].b = 0;
	        
	        c.setTheme(blue);
	        
	        var a1 = new Tooltip(c, "default");
	        var a2 = new Highlight(c, "default");
	        c.render();

	        var contentPane = new ContentPane({
	        	style: "width: 500px; height: 350px"
	        });
	        
	        var closeBtn = new Button({
	            label: "Close",
	            onClick: lang.hitch(function(){
	            	myDialog.destroy();
	            })
	        });
	        
	        var detBtn = new Button({
	            label: "See Details",
	            onClick: lang.hitch(function(){
	            	myDialog.destroy();
	            	wap.getPageManager().openPage("com_cisco_emsam_page_call_dist_detailsView", {}, true);
	            })
	        });
	        
	        var lnBtn = new Button({
	            label: "Show Calls",
	            onClick: lang.hitch(function(){
	            	
	            	var key;
	            	var pts;
	            	var lf;
	            	var nLayer = new GfxLayer();
	            	for(key in lines)
	            	{
	            		console.log(lines[key]);
	            		pts = new LineString([coor, lines[key]]);
	            		lf = new GeometryFeature(pts);
	            		if(key == 0) {
	            			lf.setStroke([204, 0, 0]);
	            		}
	            		else {
	            			lf.setStroke([0, 204, 0]);
	            		}
	            		
	            		nLayer.addFeature(lf);
	            	}
	            	mapObj.addLayer(nLayer);
	            })
	        });
	        
	        contentPane.domNode.appendChild(chart.domNode);
	        contentPane.domNode.appendChild(closeBtn.domNode);
	        contentPane.domNode.appendChild(lnBtn.domNode);
	        //contentPane.domNode.appendChild(detBtn.domNode);
	        
	        var myDialog = new Dialog({
	            title: coor.name,
	            content: contentPane.domNode,
	            style: "width: 520px;"
	        });
	        myDialog.show();
		});
	    
	    f.connect('mouseover', function(e){                       
	  	  tipdiv = domConstruct.create("div",
  	        {
  	            id : 'tipdivid',
  	            className : 'dijitTooltip dijitTooltipBelow dijitTooltipABLeft',
  	            style : {
  	                right: 'auto',
  	                left : e.clientX + 'px',
  	                width : 'auto',
  	                top : e.clientY + 'px'
  	            }
  	        },dojo.body());                       
  	        domConstruct.create("div",{
  	            className : 'dijitTooltipContainer dijitTooltipContents',
  	            innerHTML : coor.name,
  	            style : {
  	                align:'left',
  	                fontSize : '12px',
  	                role:'alert'
  	            }
  	        },tipdiv);
  		});
	    
	    f.connect('mouseout', function(e){
		    domConstruct.destroy('tipdivid');
		});
	};
        
  ready(function(){
    // create a map widget.
    var map = new Map("map-canvas");
   // This is New York
    var ny = {
      name : 'Aus-Newcastle(CL1-Advanced-Reporting)',
      y : -32.9167,
      x : 151.7500
    };
    
    var tor = {
      name : 'Aus-Perth(CL1-Advanced-Reporting)',
      y : -31.9522,
      x : 115.8589
    };
    
    var sf = {
      name : 'Aus-Adelaide_test(CL1-Advanced-Reporting)',
      y : -34.9290,
      x : 138.6010
    };
    
    var dal = {
      name : 'Hub_None(cudp-ccm80-cluster)', 
      y : -30.9290,
      x : 135.6010
	};
    
    var dc = {
    	name : 'Aus-Canberra-Queanbeyan(CL1-Advanced-Reporting)',
		y : -35.3075,
		x : 149.1244	
    };
    
    var sea = {
    	name : 'Shadow(CL1-Advanced-Reporting)',
		y : -37.3075,
		x : 144.1244	
    };
    
    var kan = {
    	name : 'Aus-Brisbane(CL1-Advanced-Reporting)',
		y : -27.4679,
		x : 153.0278	
    };
    
    // add the feature to the layer
    var layer = new GfxLayer();
    
    addPoint(ny, [204, 0, 0], true, [dal, sea, sf, dc, tor, kan], layer, map);
    addPoint(tor, [0, 204, 0], false, [sf, dc], layer, map);
    addPoint(sf, [0, 204, 0], false, [tor, kan], layer, map);
    addPoint(dal, [204, 0, 0], true, [ny], layer, map);
    addPoint(dc, [0, 204, 0], false, [tor, kan], layer, map);
    addPoint(sea, [204, 0, 0], true, [ny], layer, map);
    addPoint(kan, [0, 204, 0], false, [sf, dc], layer, map);
    
    map.fitTo([  100, -10, 170, -70  ]);
	  
  });
});
