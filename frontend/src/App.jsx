
import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './App.css'
import { getContract, getReadContract } from './blockchain/contract'

function App() {
  const [medicine, setMedicine] = useState({
    id: '',
    name: '',
    manufacturer: '',
    batch: '',
    expiry: ''
  })

  const [searchId, setSearchId] = useState('')
  useEffect(() => {
  const medicineId = new URLSearchParams(
    window.location.search
  ).get('medicineId')

  if (medicineId) {
    setSearchId(medicineId)
  }
}, [])
  const [medicines, setMedicines] = useState([])
  useEffect(() => {
  const loadMedicines = async () => {
    try {
      const contract = getReadContract()

      const events = await contract.queryFilter(
        contract.filters.MedicineRegistered()
      )

      const loadedMedicines = await Promise.all(
        events.map(async (event) => {
          const id = event.args[0]
          const data = await contract.medicines(id)

          return {
            id,
            name: data.name,
            manufacturer: data.manufacturer,
            batch: data.batchNumber,
            expiry: data.expiryDate
          }
        })
      )

      setMedicines(loadedMedicines)
      console.log('Medicines loaded:', loadedMedicines)
    } catch (error) {
      console.error('Error loading medicines:', error)
    }
  }

  loadMedicines()
}, [])
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setMedicine({
      ...medicine,
      [e.target.name]: e.target.value
    })
  }

  // Register medicine on the blockchain
  const registerMedicine = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const contract = await getContract()

      const tx = await contract.registerMedicine(
        medicine.id.trim(),
        medicine.name,
        medicine.manufacturer,
        medicine.batch,
        medicine.expiry
      )

      alert('Transaction submitted! Please wait for blockchain confirmation.')

      await tx.wait()

      setMedicines(prev => [...prev, { ...medicine }])

      alert('Medicine successfully registered on the blockchain!')

      setMedicine({
        id: '',
        name: '',
        manufacturer: '',
        batch: '',
        expiry: ''
      })
    } catch (error) {
      console.error('Registration error:', error)
      alert(error.shortMessage || error.reason || error.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  // Verify medicine directly from the blockchain
  const verifyMedicine = async () => {
    if (!searchId.trim()) {
      alert('Please enter a Medicine ID.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const contract = getReadContract()

      const exists = await contract.verifyMedicine(searchId.trim())

      if (exists) {
        const data = await contract.medicines(searchId.trim())

        setResult({
          id: searchId.trim(),
          name: data.name,
          manufacturer: data.manufacturer,
          batch: data.batchNumber,
          expiry: data.expiryDate
        })
      } else {
        setResult(false)
      }
    } catch (error) {
      console.error('Verification error:', error)
      alert(error.shortMessage || error.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>💊 MediChain</h2>
        <span>Blockchain Medicine Verification</span>
      </nav>

      <header className="hero">
        <h1>Fake Medicine Detection System</h1>
        <p>
          Verify medicine authenticity using blockchain technology.
        </p>
        <div className="notice">
          Connected to Blockchain Smart Contract
        </div>
      </header>

      <div className="dashboard">
        <div className="stats">
          <div className="stat-card">
            <h3>{medicines.length}</h3>
            <p>Medicines Registered This Session</p>
          </div>

          <div className="stat-card">
            <h3>Blockchain</h3>
            <p>Smart Contract Integration</p>
          </div>

          <div className="stat-card">
            <h3>QR Ready</h3>
            <p>QR Integration Next</p>
          </div>
        </div>

        <div className="sections">
          <section className="panel">
            <h2>📦 Register Medicine</h2>
            <p>Add medicine details to the blockchain.</p>

            <form onSubmit={registerMedicine}>
              <input
                name="id"
                placeholder="Medicine ID"
                value={medicine.id}
                onChange={handleChange}
                required
              />

              <input
                name="name"
                placeholder="Medicine Name"
                value={medicine.name}
                onChange={handleChange}
                required
              />

              <input
                name="manufacturer"
                placeholder="Manufacturer Name"
                value={medicine.manufacturer}
                onChange={handleChange}
                required
              />

              <input
                name="batch"
                placeholder="Batch Number"
                value={medicine.batch}
                onChange={handleChange}
                required
              />

              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry"
                value={medicine.expiry}
                onChange={handleChange}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Register Medicine'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>🔍 Verify Medicine</h2>
            <p>Check medicine registration on the blockchain.</p>

            <input
              placeholder="Enter Medicine ID"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value)
                setResult(null)
              }}
            />

            <button onClick={verifyMedicine} disabled={loading}>
              {loading ? 'Checking...' : 'Verify Medicine'}
            </button>

            {result === false && (
              <div className="fake">
                ⚠ Medicine ID not registered on the blockchain.
                <p>This medicine is not verified by this system.</p>
              </div>
            )}

            {result && (
              <div className="genuine">
                ✓ Medicine record found on the blockchain.
                <p>ID: {result.id}</p>
                <p>Name: {result.name}</p>
                <p>Manufacturer: {result.manufacturer}</p>
                <p>Batch: {result.batch}</p>
                <p>Expiry: {result.expiry}</p>
              </div>
            )}
          </section>
        </div>

        <section className="panel records">
          <h2>📋 Medicine Records</h2>

          <table>
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Batch</th>
                <th>Expiry</th>
              </tr>
            </thead>

            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.manufacturer}</td>
                  <td>{m.batch}</td>
                  <td>{m.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {medicines.length === 0 && (
            <p className="empty">
              No medicines registered during this session yet.
            </p>
          )}
          {medicines.length > 0 && (
  <div className="qr-section">
    <h2>📱 Medicine QR Codes</h2>
    <p>Scan the QR code to identify and verify a medicine.</p>

    <div className="qr-grid">
      {medicines.map((m) => (
        <div className="qr-card" key={m.id}>
          <h3>{m.name}</h3>
          <p>Medicine ID: {m.id}</p>

          <QRCodeSVG
            value={`http://172.17.2.12:5173/?medicineId=${encodeURIComponent(m.id)}`}
            size={180}
          />

          <p>Scan to verify this medicine</p>
        </div>
      ))}
    </div>
  </div>
)}
        </section>
      </div>

      <footer>
        Blockchain-Based Fake Medicine Detection | Mini Project
      </footer>
    </div>
  )
}

export default App
