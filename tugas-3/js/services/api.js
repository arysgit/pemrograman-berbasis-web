window.SittaApi = {
  loadBahanAjar: function () {
    return fetch('dataBahanAjar.json').then(function (response) {
      if (!response.ok) {
        throw new Error('Gagal membaca dataBahanAjar.json');
      }

      return response.json();
    });
  }
};
