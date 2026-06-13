Vue.component('app-header', {
  props: {
    tab: { type: String, required: true }
  },
  template: `
    <header class="site-header">
      <div class="container header-row">
        <div>
          <strong>SITTA UT</strong>
          <p>Pemesanan dan distribusi bahan ajar</p>
        </div>
        <nav>
          <button type="button" v-bind:class="{ active: tab === 'stok' }" v-on:click="$emit('ganti-tab', 'stok')">Stok</button>
          <button type="button" v-bind:class="{ active: tab === 'tracking' }" v-on:click="$emit('ganti-tab', 'tracking')">Tracking DO</button>
        </nav>
      </div>
    </header>
  `
});

Vue.component('status-badge', {
  props: {
    item: { type: Object, required: true }
  },
  computed: {
    label: function () {
      if (this.item.qty === 0) {
        return 'Kosong';
      }

      if (this.item.qty < this.item.safety) {
        return 'Menipis';
      }

      return 'Aman';
    },
    kelas: function () {
      if (this.item.qty === 0) {
        return 'danger';
      }

      if (this.item.qty < this.item.safety) {
        return 'warning';
      }

      return 'success';
    }
  },
  template: `
    <span class="status-wrap">
      <span class="badge" v-bind:class="kelas">{{ label }}</span>
      <span class="tooltip" v-html="item.catatanHTML"></span>
    </span>
  `
});

Vue.component('ba-stock-table', {
  props: {
    items: { type: Array, required: true }
  },
  template: `
    <div class="table-wrap">
      <p v-if="items.length === 0" class="empty">Data stok tidak ditemukan.</p>
      <table v-else>
        <thead>
          <tr>
            <th>No</th>
            <th>Kode/Judul</th>
            <th>Kategori</th>
            <th>UPBJJ</th>
            <th>Rak</th>
            <th>Harga</th>
            <th>Qty</th>
            <th>Safety</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" v-bind:key="item.kode">
            <td>{{ index + 1 }}</td>
            <td>
              <strong>{{ item.kode | upper }}</strong><br>
              {{ item.judul }}
            </td>
            <td>{{ item.kategori }}</td>
            <td>{{ item.upbjj }}</td>
            <td>{{ item.lokasiRak }}</td>
            <td>{{ item.harga | rupiah }}</td>
            <td>{{ item.qty | buah }}</td>
            <td>{{ item.safety | buah }}</td>
            <td><status-badge v-bind:item="item"></status-badge></td>
            <td>
              <button type="button" class="small" v-on:click="$emit('edit-item', item)">Edit</button>
              <button type="button" class="small danger-btn" v-on:click="$emit('delete-item', item)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
});

Vue.component('do-tracking', {
  props: {
    nomor: { type: String, required: true },
    tracking: { type: Object, required: true }
  },
  data: function () {
    return {
      progressBaru: ''
    };
  },
  template: `
    <section class="tracking-box">
      <h3>{{ nomor }}</h3>
      <p><strong>Nama:</strong> {{ tracking.nama }} ({{ tracking.nim }})</p>
      <p><strong>Status:</strong> {{ tracking.status }}</p>
      <p><strong>Ekspedisi:</strong> {{ tracking.ekspedisi }}</p>
      <p><strong>Tanggal:</strong> {{ tracking.tanggalKirim | tanggal }}</p>
      <p><strong>Paket:</strong> {{ tracking.paket }}</p>
      <p><strong>Total:</strong> {{ tracking.total | rupiah }}</p>

      <h4>Progress Perjalanan</h4>
      <ol>
        <li v-for="(step, index) in tracking.perjalanan" v-bind:key="index">
          {{ index + 1 }}. <strong>{{ step.waktu }}</strong> - {{ step.keterangan }}
        </li>
      </ol>

      <label>
        Tambah progress
        <input type="text" v-model.trim="progressBaru" placeholder="Contoh: Paket tiba di hub" v-on:keyup.enter="$emit('tambah-progress', progressBaru); progressBaru = ''">
      </label>
      <button type="button" v-on:click="$emit('tambah-progress', progressBaru); progressBaru = ''">Tambah Progress</button>
    </section>
  `
});

Vue.component('app-modal', {
  props: {
    item: { type: Object, required: true }
  },
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h3>Konfirmasi Hapus</h3>
        <p>Hapus data <strong>{{ item.kode }}</strong> - {{ item.judul }}?</p>
        <button type="button" class="danger-btn" v-on:click="$emit('confirm')">Ya, hapus</button>
        <button type="button" class="secondary" v-on:click="$emit('cancel')">Batal</button>
      </div>
    </div>
  `
});
