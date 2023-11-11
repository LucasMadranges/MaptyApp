'use strict';

// Data
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    type = 'running';

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
    type = 'cycling';

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
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapEvent;
    #workouts = [];

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
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        event.preventDefault();

        // Get data from form
        const type = inputType.value;
        const distance = Number(inputDistance.value);
        const duration = Number(inputDuration.value);
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        // If activity running, create a running object
        if (type === 'running') {
            const cadence = Number(inputCadence.value);

            // Check if data is valid
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert('Inputs have to be position numbers!');

            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // If activity cycling, create a running object
        if (type === 'cycling') {
            const elevation = Number(inputElevation.value);

            // Check if data is valid
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Inputs have to be position numbers!');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add new workout to work out array
        this.#workouts.push(workout);
        console.log(workout);

        // Render work out on map as marker
        this.renderWorkoutMarker(workout)

        // render work out on list

        // Hide form + clear input fields
        form.classList.add('hidden');
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    }

    renderWorkoutMarker(workout) {
        // Render work out on map as marker
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            }))
            .setPopupContent(`${workout.distance}`)
            .openPopup();
    }
}

const app = new App();
app._getPosition();