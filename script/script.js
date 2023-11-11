'use strict';

// Data
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Class Parents
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance; // in km
        this.duration = duration; // in min
    }
}

// Class Running
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min / km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

// Class Cycling
class Cycling extends Workout {
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
    }

    calcSpeed() {
        // km / h
        this.speed = this.distance / (this.duration / 60)
        return this.speed;
    }
}

// const run1 = new Running([39, -12], 5.2, 24, 17)
// const cycling1 = new Cycling([39, -12], 27, 95, 523)

// Application
class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        // Event form submit
        form.addEventListener("submit", this._newWorkout.bind(this));

        // OnChange select
        inputType.addEventListener("change", this._toggleElevationField.bind(this))
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
                alert('Could not get your position!')
            });
        }
    }

    _loadMap(position) {
        const {latitude} = position.coords;
        const {longitude} = position.coords;

        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Event click on map
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(event) {
        event.preventDefault();

        // Clear
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        // Display marker
        const {lat, lng} = this.#mapEvent.latlng;

        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup',
            }))
            .setPopupContent('Workout')
            .openPopup();
    }
}

const app = new App();
app._getPosition();