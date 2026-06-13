Vue.filter('rupiah', function (value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
});

Vue.filter('buah', function (value) {
  return (Number(value) || 0) + ' buah';
});

Vue.filter('upper', function (value) {
  return String(value || '').toUpperCase();
});

Vue.filter('tanggal', function (value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
});

new Vue({
  el: '#app',
  data: {
    judulTugas: 'Tugas Praktik 3 - Vue Component dan Template',
    tab: 'stok',
    loading: true,
    loadError: '',
    message: '',
    upbjjList: [],
    kategoriList: [],
    pengirimanList: [],
    paketList: [],
    stok: [],
    tracking: {},
    filter: {
      keyword: '',
      upbjj: '',
      kategori: '',
      sort: 'judul',
      kritis: false
    },
    formStok: {
      kode: '',
      judul: '',
      kategori: '',
      upbjj: '',
      lokasiRak: '',
      harga: 0,
      qty: 0,
      safety: 0,
      catatanHTML: ''
    },
    editMode: false,
    hapusTarget: null,
    trackingKeyword: '',
    trackingNomor: '',
    trackingResult: null,
    formDO: {
      nim: '',
      nama: '',
      ekspedisi: '',
      paket: '',
      tanggalKirim: new Date().toISOString().slice(0, 10)
    }
  },
  computed: {
    kategoriUntukUpbjj: function () {
      var kategori = this.stok
        .filter(function (item) {
          return item.upbjj === this.filter.upbjj;
        }, this)
        .map(function (item) {
          return item.kategori;
        });

      return Array.from(new Set(kategori));
    },
    filteredStok: function () {
      var keyword = this.filter.keyword.toLowerCase();
      var hasil = this.stok.filter(function (item) {
        var cocokKeyword = item.kode.toLowerCase().includes(keyword) ||
          item.judul.toLowerCase().includes(keyword);
        var cocokUpbjj = !this.filter.upbjj || item.upbjj === this.filter.upbjj;
        var cocokKategori = !this.filter.kategori || item.kategori === this.filter.kategori;
        var cocokKritis = !this.filter.kritis || item.qty < item.safety || item.qty === 0;

        return cocokKeyword && cocokUpbjj && cocokKategori && cocokKritis;
      }, this);

      return hasil.sort(function (a, b) {
        if (this.filter.sort === 'qty') {
          return a.qty - b.qty;
        }

        if (this.filter.sort === 'harga') {
          return b.harga - a.harga;
        }

        return a.judul.localeCompare(b.judul);
      }.bind(this));
    },
    totalKritis: function () {
      return this.stok.filter(function (item) {
        return item.qty < item.safety || item.qty === 0;
      }).length;
    },
    stokErrors: function () {
      var errors = [];

      if (!this.formStok.kode) {
        errors.push('Kode wajib diisi.');
      }

      if (!this.formStok.judul) {
        errors.push('Judul wajib diisi.');
      }

      if (!this.formStok.kategori) {
        errors.push('Kategori wajib dipilih.');
      }

      if (!this.formStok.upbjj) {
        errors.push('UT-Daerah wajib dipilih.');
      }

      if (this.formStok.harga <= 0) {
        errors.push('Harga harus lebih dari 0.');
      }

      if (this.formStok.qty < 0 || this.formStok.safety < 0) {
        errors.push('Qty dan safety tidak boleh negatif.');
      }

      var kodeSudahAda = this.stok.some(function (item) {
        return item.kode.toUpperCase() === this.formStok.kode.toUpperCase();
      }, this);

      if (!this.editMode && kodeSudahAda) {
        errors.push('Kode bahan ajar sudah ada.');
      }

      return errors;
    },
    nomorDOBaru: function () {
      var tahun = new Date().getFullYear();
      var jumlah = Object.keys(this.tracking).length + 1;
      return 'DO' + tahun + '-' + String(jumlah).padStart(4, '0');
    },
    paketDipilih: function () {
      return this.paketList.find(function (paket) {
        return paket.kode === this.formDO.paket;
      }, this) || null;
    },
    doErrors: function () {
      var errors = [];

      if (!/^\d{9,12}$/.test(this.formDO.nim)) {
        errors.push('NIM harus 9 sampai 12 angka.');
      }

      if (!this.formDO.nama) {
        errors.push('Nama wajib diisi.');
      }

      if (!this.formDO.ekspedisi) {
        errors.push('Ekspedisi wajib dipilih.');
      }

      if (!this.formDO.paket) {
        errors.push('Paket bahan ajar wajib dipilih.');
      }

      if (!this.formDO.tanggalKirim) {
        errors.push('Tanggal kirim wajib diisi.');
      }

      return errors;
    }
  },
  created: function () {
    this.loadData();
  },
  methods: {
    loadData: function () {
      window.SittaApi.loadBahanAjar()
        .then(function (data) {
          this.upbjjList = data.upbjjList || [];
          this.kategoriList = data.kategoriList || [];
          this.pengirimanList = data.pengirimanList || [];
          this.paketList = data.paket || [];
          this.stok = data.stok || [];
          this.tracking = this.normalizeTracking(data.tracking || []);
          this.loading = false;
          this.message = 'Data berhasil dibaca dari dataBahanAjar.json.';
        }.bind(this))
        .catch(function (error) {
          this.loading = false;
          this.loadError = error.message + '. Jalankan halaman lewat server lokal agar fetch JSON bisa bekerja.';
        }.bind(this));
    },
    normalizeTracking: function (trackingArray) {
      return trackingArray.reduce(function (result, item) {
        Object.keys(item).forEach(function (kode) {
          result[kode] = item[kode];
        });

        return result;
      }, {});
    },
    resetFilter: function () {
      this.filter = {
        keyword: '',
        upbjj: '',
        kategori: '',
        sort: 'judul',
        kritis: false
      };
      this.message = 'Filter stok direset.';
    },
    resetFormStok: function () {
      this.formStok = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ''
      };
      this.editMode = false;
    },
    simpanStok: function () {
      if (this.stokErrors.length > 0) {
        return;
      }

      var data = Object.assign({}, this.formStok, {
        kode: this.formStok.kode.toUpperCase(),
        catatanHTML: this.formStok.catatanHTML || '<em>Tidak ada catatan</em>'
      });

      if (this.editMode) {
        var index = this.stok.findIndex(function (item) {
          return item.kode === data.kode;
        });

        this.$set(this.stok, index, data);
        this.message = 'Data stok ' + data.kode + ' berhasil diupdate.';
      } else {
        this.stok.push(data);
        this.message = 'Data stok ' + data.kode + ' berhasil ditambahkan.';
      }

      this.resetFormStok();
    },
    editStok: function (item) {
      this.formStok = Object.assign({}, item);
      this.editMode = true;
      this.message = 'Mode edit aktif untuk ' + item.kode + '.';
    },
    mintaHapus: function (item) {
      this.hapusTarget = item;
    },
    hapusStok: function () {
      this.stok = this.stok.filter(function (item) {
        return item.kode !== this.hapusTarget.kode;
      }, this);
      this.message = 'Data stok ' + this.hapusTarget.kode + ' dihapus.';
      this.hapusTarget = null;
    },
    cariTracking: function () {
      var keyword = this.trackingKeyword.toUpperCase();
      var nomor = Object.keys(this.tracking).find(function (kode) {
        var item = this.tracking[kode];
        return kode === keyword || item.nim === keyword;
      }, this);

      this.trackingNomor = nomor || '';
      this.trackingResult = nomor ? this.tracking[nomor] : null;
      this.message = nomor ? 'Data tracking ditemukan.' : 'Data tracking tidak ditemukan.';
    },
    pilihTracking: function (kode) {
      this.trackingKeyword = kode;
      this.cariTracking();
    },
    resetTracking: function () {
      this.trackingKeyword = '';
      this.trackingNomor = '';
      this.trackingResult = null;
      this.message = 'Pencarian tracking direset.';
    },
    tambahDO: function () {
      if (this.doErrors.length > 0 || !this.paketDipilih) {
        return;
      }

      var nomorBaru = this.nomorDOBaru;

      this.$set(this.tracking, nomorBaru, {
        nim: this.formDO.nim,
        nama: this.formDO.nama,
        status: 'Diproses',
        ekspedisi: this.formDO.ekspedisi,
        tanggalKirim: this.formDO.tanggalKirim,
        paket: this.formDO.paket,
        total: this.paketDipilih.harga,
        perjalanan: [
          {
            waktu: new Date().toLocaleString('id-ID'),
            keterangan: 'Delivery order dibuat'
          }
        ]
      });

      this.trackingKeyword = nomorBaru;
      this.formDO = {
        nim: '',
        nama: '',
        ekspedisi: '',
        paket: '',
        tanggalKirim: new Date().toISOString().slice(0, 10)
      };
      this.cariTracking();
      this.message = 'Delivery order baru berhasil ditambahkan.';
    },
    tambahProgress: function (keterangan) {
      if (!this.trackingResult || !keterangan) {
        return;
      }

      this.trackingResult.perjalanan.push({
        waktu: new Date().toLocaleString('id-ID'),
        keterangan: keterangan
      });
      this.trackingResult.status = keterangan;
      this.message = 'Progress perjalanan ditambahkan.';
    }
  },
  watch: {
    'filter.upbjj': function (value) {
      this.filter.kategori = '';
      this.message = value ? 'Filter UT-Daerah aktif: ' + value + '.' : 'Filter UT-Daerah dihapus.';
    },
    'filter.kritis': function (value) {
      this.message = value ? 'Menampilkan stok menipis dan kosong.' : 'Menampilkan semua stok.';
    },
    'formStok.qty': function (value) {
      if (value < this.formStok.safety) {
        this.message = 'Qty lebih kecil dari safety, status akan Menipis.';
      }
    },
    trackingKeyword: function (value) {
      if (value && value !== value.toUpperCase()) {
        this.trackingKeyword = value.toUpperCase();
      }
    }
  }
});
