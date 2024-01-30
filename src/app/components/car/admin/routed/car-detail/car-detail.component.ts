import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  options: google.maps.MapOptions = {
    center: { lat: 40, lng: -20 },
    zoom: 4,
  };

  center: google.maps.LatLngLiteral = { lat: 40, lng: -20 };
  display: google.maps.LatLngLiteral = { lat: 40, lng: -20 };

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.center = event.latLng.toJSON();
    }
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.display = event.latLng.toJSON();
    }
  }

  constructor() {}

  ngOnInit(): void {
    this.center = { lat: 40, lng: -20 };
    this.display = { lat: 40, lng: -20 };
  }
}
