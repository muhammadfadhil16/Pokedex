const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
let currentPage = 1;
const limit = 12; // Batas jumlah Pokémon per halaman
let totalPokemon = 0; // Variabel untuk menyimpan total Pokémon
let allPokemon = []; // Variabel untuk menyimpan semua Pokémon

// Fungsi untuk mengambil dan menampilkan daftar Pokémon
function fetchPokemonList(page = 1) {
    const offset = (page - 1) * limit;
    fetch(`${apiUrl}?limit=${limit}&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            totalPokemon = data.count; // Ambil total Pokémon dari response
            const pokemonRequests = data.results.map(pokemon =>
                fetch(pokemon.url).then(response => response.json())
            );
            return Promise.all(pokemonRequests);
        })
        .then(pokemonDetails => {
            allPokemon = pokemonDetails; // Simpan semua Pokémon
            displayPokemonList(allPokemon);
            updatePageInfo(page); // Perbarui informasi halaman
        })
        .catch(error => {
            showError('Failed to fetch Pokémon list. Please try again.');
            console.error('Error:', error);
        });
}

// Fungsi untuk menampilkan daftar Pokémon
function displayPokemonList(pokemonList) {
    const pokemonContainer = document.getElementById('pokemon-list');
    pokemonContainer.innerHTML = ''; // Hapus konten sebelumnya

    pokemonList.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('bg-white', 'p-5', 'rounded', 'shadow-lg', 'cursor-pointer', 'text-center');
        pokemonItem.innerHTML = `
            <h3 class="text-xl font-bold">${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-24 mx-auto mb-2">
        `;
        pokemonItem.addEventListener('click', () => {
            displayPokemonDetails(pokemon); // Tampilkan detail Pokémon
        });
        pokemonContainer.appendChild(pokemonItem);
    });
}

// Fungsi untuk menampilkan detail Pokémon
function displayPokemonDetails(pokemon) {
    const detailsContainer = document.getElementById('pokemon-details');
    document.getElementById('pokemon-name').innerText = pokemon.name;
    document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
    document.getElementById('pokemon-info').innerHTML = `
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;

    detailsContainer.classList.remove('hidden');
    document.getElementById('pokemon-list').classList.add('hidden');
    document.getElementById('page-control').classList.add('hidden');
}

// Fungsi untuk kembali ke daftar Pokémon
document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('pokemon-details').classList.add('hidden');
    document.getElementById('pokemon-list').classList.remove('hidden');
    document.getElementById('page-control').classList.remove('hidden');
});

// Fungsi untuk menangani error
function showError(message) {
    const errorMessage = document.getElementById('error-massage');
    errorMessage.innerText = message;
    errorMessage.classList.remove('hidden');
}

// Fungsi untuk memperbarui informasi halaman
function updatePageInfo(currentPage) {
    const totalPages = Math.ceil(totalPokemon / limit); // Hitung jumlah total halaman
    document.getElementById('page-number').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

// Pencarian Pokémon berdasarkan input pengguna
document.getElementById('search-input').addEventListener('input', function() {
    const searchValue = document.getElementById('search-input').value.toLowerCase()
    if (searchValue) {
        const filteredPokemon = allPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchValue)
        );
        displayPokemonList(filteredPokemon);
    } else {
        fetchPokemonList(currentPage);
    }
});

// Navigasi halaman sebelumnya
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPokemonList(currentPage);
    }
});

// Navigasi halaman berikutnya
document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < Math.ceil(totalPokemon / limit)) {
        currentPage++;
        fetchPokemonList(currentPage);
    }
});

// Inisialisasi: Memuat daftar Pokémon pertama kali
fetchPokemonList();
