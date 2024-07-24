/******************************************************************************
 * Leaflet.PointInPolygon
 * @author Brian S Hayes (Hayeswise)
 * @license MIT License, Copyright (c) 2017 Brian Hayes ("Hayeswise")
 *
 * Thanks to:<br>
 * Dan Sunday's Winding Number and isLeft C++ implementation - http://geomalgorithms.com/.
 *   Copyright and License: http://geomalgorithms.com/a03-_inclusion.html
 * Leaflet.Geodesic by Kevin Brasier (a.k.a. Fragger)<br>
 */
!function(t){"use strict";t.Polyline.prototype.contains=function(t){return!!this.getBounds().contains(t)&&0!==this.getWindingNumber(t)},t.LatLng.prototype.isLeft=function(t,n){return(t.lng-this.lng)*(n.lat-this.lat)-(n.lng-this.lng)*(t.lat-this.lat)},t.Polyline.prototype.getWindingNumber=function(n){var r,i,l,a,e;for(a=function n(r){return(Array.isArray?Array.isArray(r):t.Util.isArray(r))?r.reduce((function(t,r,i,l){return t.concat(Array.isArray(r)?n(r):r)}),[]):r}(a=this.getLatLngs()),a=a.filter((function(t,n,r){return!(n>0&&t.lat===r[n-1].lat&&t.lng===r[n-1].lng)})),(l=a.length)>0&&(a[l-1].lat!==a[0].lat||a[l-1].lng!==a[0].lng)&&a.push(a[0]),l=a.length-1,e=0,r=0;r<l;r++){if(0===(i=a[r].isLeft(a[r+1],n))){e=1;break}0!==i?a[r].lat<=n.lat?a[r+1].lat>n.lat&&i>0&&e++:a[r+1].lat<=n.lat&&i<0&&e--:e++}return e}}(L);