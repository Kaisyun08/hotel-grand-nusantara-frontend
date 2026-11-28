const BASE_URL = 'http://192.168.1.103:3000/api';

export const TipeKamarService = {
    getAllTipeKamar: async () => {
        try{
            const response = await fetch(`${BASE_URL}/tipe_kamar`);
            if(!response.ok) {
                throw new Error('Gagal mengambil data tipe kamar');
            }
            const result = await response.json();
            return Array.isArray(result) ? result : (result.data || []);
        }catch(error){
            console.error('Error getAllTipeKamar:', error);
            throw error;
        }
    },

    getTipeKamarById: async(id) => {
        try{
            const response = await fetch(`${BASE_URL}/tipe_kamar/${id}`);
            if(!response.ok){
                throw new Error(`Gagal mengambil data tipe kamar dengan ID: ${id}`);
            }
            const result = await response.json();
            return result.data ? result.data : result;
        }catch(error){
            console.error(`Error getTipeKamarById (${id})`, error);
            throw error;
        }
    },
};