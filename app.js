const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
const searchInput = document.getElementById('search-input');
let currentPage = 1;
const limit = 20; // Batasi 20 Pokémon per halaman
let totalPokemon = 0;

// Fungsi untuk menampilkan daftar Pokémon
function displayPokemon(pokemonList) {
  const container = document.getElementById('pokemon-list');
  container.innerHTML = ''; // Kosongkan container sebelum menampilkan hasil

  if (pokemonList.length === 0) {
    container.innerHTML = '<p>No Pokémon found.</p>'; // Tampilkan pesan jika tidak ada hasil
    return;
  }

  pokemonList.forEach(pokemon => {
    const pokemonItem = document.createElement('div');
    pokemonItem.classList.add(
        'border', 'border-gray-300', 'rounded-lg', 'shadow-lg', 'p-4', 
        'bg-white', 'hover:shadow-2xl', 'cursor-pointer', 'transition'
    );
    
    pokemonItem.innerHTML = `
      <h3 class="text-lg font-bold text-center capitalize mb-2">${pokemon.name}</h3>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-24 mx-auto">
    `;

    pokemonItem.addEventListener('click', () => displayPokemonDetails(pokemon));
    container.appendChild(pokemonItem);
});

}

// Fungsi untuk menampilkan detail Pokémon
function displayPokemonDetails(pokemon) {
  const detailsContainer = document.getElementById('pokemon-details');
  document.getElementById('pokemon-name').textContent = pokemon.name;
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

// Fungsi untuk mengambil daftar Pokémon sesuai halaman
function fetchPokemonList(page = 1) {
  const offset = (page - 1) * limit;
  
  fetch(`${apiUrl}?limit=${limit}&offset=${offset}`)
    .then(response => response.json())
    .then(data => {
      totalPokemon = data.count;
      const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
      return Promise.all(pokemonPromises);
    })
    .then(pokemonDetails => {
      displayPokemon(pokemonDetails);
      updatePageInfo(page);
    })
    .catch(error => {
      console.error('Error fetching Pokémon:', error);
    });
}

// Fungsi untuk memperbarui tampilan informasi halaman
function updatePageInfo(page) {
  const totalPages = Math.ceil(totalPokemon / limit);
  document.getElementById('page-number').textContent = `Page ${page} of ${totalPages}`;
  document.getElementById('prev-btn').disabled = page === 1;
  document.getElementById('next-btn').disabled = page === totalPages;
}

// Tombol navigasi halaman sebelumnya
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemonList(currentPage);
  }
});

// Tombol navigasi halaman berikutnya
document.getElementById('next-btn').addEventListener('click', () => {
  if (currentPage < Math.ceil(totalPokemon / limit)) {
    currentPage++;
    fetchPokemonList(currentPage);
  }
});

// Fungsi pencarian Pokémon berdasarkan input pengguna
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();

  // Jika ada input pencarian, lakukan pencarian tanpa paginasi
  if (searchTerm) {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1118`)
      .then(response => response.json())
      .then(data => {
        const filteredPokemonPromises = data.results
          .filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm))
          .map(pokemon => fetch(pokemon.url).then(res => res.json()));

        Promise.all(filteredPokemonPromises).then(pokemonDetails => {
          displayPokemon(pokemonDetails); // Tampilkan Pokémon yang difilter
          document.getElementById('page-control').classList.add('hidden'); // Sembunyikan pagination
        });
      })
      .catch(error => {
        console.error('Error fetching Pokémon:', error);
        displayPokemon([]); // Kosongkan daftar jika ada kesalahan
      });
  } else {
    // Jika input pencarian kosong, kembali ke pagination default
    document.getElementById('page-control').classList.remove('hidden');
    fetchPokemonList(currentPage);
  }
});

// Tombol kembali ke daftar Pokémon
document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('pokemon-details').classList.add('hidden');
  document.getElementById('pokemon-list').classList.remove('hidden');
  document.getElementById('page-control').classList.remove('hidden');
});

// Inisialisasi: Memuat daftar Pokémon pertama kali
fetchPokemonList();
