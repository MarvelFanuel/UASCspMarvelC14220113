'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  nama_produk: string
  harga_satuan: number
  quantity: number
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [namaProduk, setNamaProduk] = useState('')
  const [hargaSatuan, setHargaSatuan] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const user = searchParams.get('user')

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const clearForm = () => {
    setNamaProduk('')
    setHargaSatuan('')
    setQuantity('')
    setEditId(null)
  }

  const handleInsert = async () => {
    if (!namaProduk || !hargaSatuan || !quantity) {
      setError('Semua input harus diisi.')
      return
    }

    const { error } = await supabase.from('products').insert([
      {
        nama_produk: namaProduk,
        harga_satuan: Number(hargaSatuan),
        quantity: Number(quantity),
      },
    ])

    if (error) {
      setError('Gagal menambah produk.')
    } else {
      setMessage('Produk berhasil ditambah!')
      clearForm()
      fetchProducts()
    }
  }

  const handleDelete = async (id: number) => {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const handleEdit = (product: Product) => {
    setEditId(product.id)
    setNamaProduk(product.nama_produk)
    setHargaSatuan(String(product.harga_satuan))
    setQuantity(String(product.quantity))
  }

  const handleUpdate = async () => {
    if (!editId) return
    await supabase
      .from('products')
      .update({
        nama_produk: namaProduk,
        harga_satuan: Number(hargaSatuan),
        quantity: Number(quantity),
      })
      .eq('id', editId)

    setMessage('Produk berhasil diupdate!')
    clearForm()
    fetchProducts()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard ({role})
          </h1>
          <p className="text-gray-600">Welcome, {user}</p>
        </div>

        {role === 'admin' && (
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {editId ? 'Edit Produk' : 'Tambah Produk'}
            </h2>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <input
                type="text"
                placeholder="Nama Produk"
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={namaProduk}
                onChange={(e) => setNamaProduk(e.target.value)}
              />
              <input
                type="number"
                placeholder="Harga Satuan"
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={hargaSatuan}
                onChange={(e) => setHargaSatuan(e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {message && <p className="text-green-600 mt-2">{message}</p>}

            <button
              onClick={editId ? handleUpdate : handleInsert}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md"
            >
              {editId ? 'Update' : 'Tambah'}
            </button>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Daftar Produk
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-500">Belum ada produk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-200 text-gray-700 text-center">
                  <tr>
                    <th className="py-2 px-4">Nama Produk</th>
                    <th className="py-2 px-4">Harga</th>
                    <th className="py-2 px-4">Qty</th>
                    {role === 'admin' && <th className="py-2 px-4">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="text-center">
                  {products.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-indigo-50 transition duration-200"
                    >
                      <td className="py-2 px-4">{item.nama_produk}</td>
                      <td className="py-2 px-4">
                        Rp {item.harga_satuan.toLocaleString()}
                      </td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      {role === 'admin' && (
                        <td className="py-2 px-4 space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
