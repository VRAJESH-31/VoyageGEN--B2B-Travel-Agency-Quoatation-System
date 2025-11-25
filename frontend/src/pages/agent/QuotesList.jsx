import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaFileInvoice, FaEye, FaDownload, FaSpinner, FaTrash, FaShare, FaEnvelope, FaWhatsapp, FaInstagram } from 'react-icons/fa';

const QuotesList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareDropdown, setShareDropdown] = useState(null); // Track which quote's share menu is open

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotes`, config);
                setQuotes(res.data);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [user]);

    const downloadPDF = (quote) => {
        // Map destinations to specific high-quality Unsplash images
        const getDestinationImage = (destination) => {
            const imageMap = {
                'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop&q=80',
                'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop&q=80',
                'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=400&fit=crop&q=80',
                'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=400&fit=crop&q=80',
                'Switzerland': 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400&h=400&fit=crop&q=80',
                'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=400&fit=crop&q=80',
                'Greece': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=400&fit=crop&q=80',
                'Thailand': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=400&fit=crop&q=80',
                'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=400&fit=crop&q=80',
                'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=400&fit=crop&q=80',
                'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop&q=80',
                'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop&q=80',
                'Australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&h=400&fit=crop&q=80',
                'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=400&fit=crop&q=80',
                'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=400&fit=crop&q=80',
                'Egypt': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=400&fit=crop&q=80',
                'India': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=400&fit=crop&q=80',
                'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=400&fit=crop&q=80',
                'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=400&fit=crop&q=80',
                'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=400&fit=crop&q=80',
                'Kashmir': 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&h=400&fit=crop&q=80',
                'Himachal': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=400&fit=crop&q=80',
                'Uttarakhand': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=400&fit=crop&q=80',
            };

            // Try to find exact match or partial match
            const dest = destination || '';
            for (const [key, value] of Object.entries(imageMap)) {
                if (dest.toLowerCase().includes(key.toLowerCase())) {
                    return value;
                }
            }

            // Default travel image if destination not found
            return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop&q=80';
        };

        const printWindow = window.open('', '', 'height=900,width=800');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>VoyageGen Quote #${quote._id.slice(-6)}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Inter', sans-serif; 
                        padding: 0;
                        color: #ffffff;
                        background: #000000;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: #09090b;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    }
                    .header { 
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 50px 40px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    }
                    .header h1 { 
                        font-family: 'Playfair Display', serif;
                        font-size: 48px;
                        font-weight: 900;
                        margin-bottom: 10px;
                        letter-spacing: 2px;
                        position: relative;
                        z-index: 1;
                    }
                    .header .subtitle {
                        font-size: 18px;
                        font-weight: 300;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        opacity: 0.95;
                        position: relative;
                        z-index: 1;
                    }
                    .quote-id {
                        background: rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                        padding: 15px 30px;
                        border-radius: 50px;
                        display: inline-block;
                        margin-top: 20px;
                        font-weight: 600;
                        position: relative;
                        z-index: 1;
                    }
                    .content {
                        padding: 40px;
                        background: #09090b;
                    }
                    .trip-banner {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 0;
                        border-radius: 20px;
                        margin-bottom: 40px;
                        display: flex;
                        align-items: stretch;
                        gap: 0;
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        overflow: hidden;
                        box-shadow: 0 10px 40px rgba(16, 185, 129, 0.2);
                    }
                    .trip-banner-image {
                        width: 280px;
                        min-width: 280px;
                        height: 200px;
                        position: relative;
                        overflow: hidden;
                    }
                    .trip-banner img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center;
                    }
                    .trip-info {
                        flex: 1;
                        padding: 35px 40px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .trip-info h2 {
                        font-family: 'Playfair Display', serif;
                        font-size: 42px;
                        margin-bottom: 15px;
                        font-weight: 900;
                        line-height: 1.1;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .trip-meta {
                        display: flex;
                        gap: 15px;
                        font-size: 13px;
                        opacity: 0.95;
                        flex-wrap: wrap;
                    }
                    .trip-meta span {
                        background: rgba(0,0,0,0.25);
                        padding: 8px 16px;
                        border-radius: 25px;
                        font-weight: 600;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255,255,255,0.2);
                    }
                    .section { 
                        margin: 40px 0;
                        page-break-inside: avoid;
                    }
                    .section-title { 
                        font-family: 'Playfair Display', serif;
                        color: #10b981;
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 3px solid #10b981;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .section-icon {
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        border-radius: 8px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 18px;
                    }
                    table { 
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin: 20px 0;
                        border-radius: 12px;
                        overflow: hidden;
                        background: #18181b;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    th { 
                        background: #27272a;
                        color: #a1a1aa;
                        padding: 16px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    td { 
                        padding: 16px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        background: #18181b;
                        color: #e4e4e7;
                    }
                    tr:last-child td {
                        border-bottom: none;
                    }
                    tr:hover td {
                        background: #27272a;
                    }
                    .item-name {
                        font-weight: 600;
                        color: #ffffff;
                        font-size: 15px;
                    }
                    .price {
                        color: #10b981;
                        font-weight: 700;
                        font-size: 16px;
                    }
                    .cost-summary {
                        background: #18181b;
                        padding: 30px;
                        border-radius: 15px;
                        margin-top: 30px;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .cost-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        font-size: 15px;
                    }
                    .cost-row:last-child {
                        border-bottom: none;
                    }
                    .cost-label {
                        color: #a1a1aa;
                        font-weight: 500;
                    }
                    .cost-value {
                        font-weight: 600;
                        color: #ffffff;
                    }
                    .total-row {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin-top: 15px;
                        font-size: 18px;
                    }
                    .total-row .cost-label {
                        color: white;
                        font-size: 16px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .total-row .cost-value {
                        color: white;
                        font-size: 32px;
                        font-weight: 700;
                    }
                    .footer { 
                        background: #000000;
                        color: white;
                        text-align: center;
                        padding: 40px;
                        margin-top: 50px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                    }
                    .footer h3 {
                        font-family: 'Playfair Display', serif;
                        font-size: 24px;
                        margin-bottom: 15px;
                        color: #10b981;
                    }
                    .footer p {
                        opacity: 0.8;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #a1a1aa;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 8px 20px;
                        border-radius: 25px;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        background: rgba(0,0,0,0.3);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.2);
                    }
                    @media print {
                        body { background: #09090b; }
                        .container { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>VoyageGen</h1>
                        <div class="subtitle">Premium Travel Quotation</div>
                        <div class="quote-id">Quote #${quote._id.slice(-6)}</div>
                    </div>

                    <div class="content">
                        <div class="trip-banner">
                            ${quote.requirementId?.destination ? `
                                <div class="trip-banner-image">
                                    <img src="${getDestinationImage(quote.requirementId.destination)}" 
                                         alt="${quote.requirementId.destination}">
                                </div>
                            ` : ''}
                            <div class="trip-info">
                                <h2>${quote.requirementId?.destination || 'Dream Destination'}</h2>
                                <div class="trip-meta">
                                    <span>📅 ${quote.requirementId?.duration || 'N/A'} Days</span>
                                    <span>✈️ ${quote.requirementId?.tripType || 'Adventure'}</span>
                                    <span class="status-badge">${quote.status}</span>
                                </div>
                            </div>
                        </div>

                        ${quote.sections?.hotels?.length > 0 ? `
                        <div class="section">
                            <h2 class="section-title">
                                <span class="section-icon">🏨</span>
                                Accommodation
                            </h2>
                            <table>
                                <tr>
                                    <th>Hotel</th>
                                    <th>Location</th>
                                    <th>Room Type</th>
                                    <th>Nights</th>
                                    <th>Price/Night</th>
                                    <th>Total</th>
                                </tr>
                                ${quote.sections.hotels.map(hotel => `
                                <tr>
                                    <td class="item-name">${hotel.name}</td>
                                    <td>${hotel.city}</td>
                                    <td>${hotel.roomType}</td>
                                    <td>${hotel.nights}</td>
                                    <td class="price">₹${hotel.unitPrice?.toLocaleString()}</td>
                                    <td class="price">₹${hotel.total?.toLocaleString()}</td>
                                </tr>
                                `).join('')}
                            </table>
                        </div>
                        ` : ''}

                        ${quote.sections?.transport?.length > 0 ? `
                        <div class="section">
                            <h2 class="section-title">
                                <span class="section-icon">🚗</span>
                                Transportation
                            </h2>
                            <table>
                                <tr>
                                    <th>Vehicle Type</th>
                                    <th>Days</th>
                                    <th>Price/Day</th>
                                    <th>Total</th>
                                </tr>
                                ${quote.sections.transport.map(transport => `
                                <tr>
                                    <td class="item-name">${transport.type}</td>
                                    <td>${transport.days}</td>
                                    <td class="price">₹${transport.unitPrice?.toLocaleString()}</td>
                                    <td class="price">₹${transport.total?.toLocaleString()}</td>
                                </tr>
                                `).join('')}
                            </table>
                        </div>
                        ` : ''}

                        ${quote.sections?.activities?.length > 0 ? `
                        <div class="section">
                            <h2 class="section-title">
                                <span class="section-icon">🎯</span>
                                Activities & Experiences
                            </h2>
                            <table>
                                <tr>
                                    <th>Activity</th>
                                    <th>Participants</th>
                                    <th>Price/Person</th>
                                    <th>Total</th>
                                </tr>
                                ${quote.sections.activities.map(activity => `
                                <tr>
                                    <td class="item-name">${activity.name}</td>
                                    <td>${activity.qty}</td>
                                    <td class="price">₹${activity.unitPrice?.toLocaleString()}</td>
                                    <td class="price">₹${activity.total?.toLocaleString()}</td>
                                </tr>
                                `).join('')}
                            </table>
                        </div>
                        ` : ''}

                        <div class="section">
                            <h2 class="section-title">
                                <span class="section-icon">💰</span>
                                Cost Breakdown
                            </h2>
                            <div class="cost-summary">
                                <div class="cost-row">
                                    <span class="cost-label">Base Package Cost</span>
                                    <span class="cost-value">₹${quote.costs?.net?.toLocaleString() || '0'}</span>
                                </div>
                                <div class="cost-row">
                                    <span class="cost-label">Service Margin (${quote.costs?.margin || 0}%)</span>
                                    <span class="cost-value">₹${((quote.costs?.final - quote.costs?.net) || 0).toLocaleString()}</span>
                                </div>
                                <div class="cost-row">
                                    <span class="cost-label">Per Person Cost</span>
                                    <span class="cost-value">₹${quote.costs?.perHead?.toLocaleString() || '0'}</span>
                                </div>
                                <div class="total-row">
                                    <span class="cost-label">Total Package Price</span>
                                    <span class="cost-value">₹${quote.costs?.final?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <h3>Thank You for Choosing VoyageGen!</h3>
                        <p>Your journey to unforgettable experiences begins here.</p>
                        <p style="margin-top: 10px;">📧 support@voyagegen.com | 📱 +91 1800-VOYAGE | 🌐 www.voyagegen.com</p>
                        <p style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
                            Generated on ${new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for images and fonts to load before printing
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleShare = (quote, method) => {
        const quoteUrl = `${window.location.origin}/agent/quote/${quote._id}`;
        const destination = quote.requirementId?.destination || 'Dream Destination';
        const price = quote.costs?.final?.toLocaleString() || '0';
        const duration = quote.requirementId?.duration || 'N/A';

        const message = `Check out this amazing travel quote for ${destination}!\n\n` +
            `📍 Destination: ${destination}\n` +
            `⏱️ Duration: ${duration} days\n` +
            `💰 Total Price: ₹${price}\n\n` +
            `View details: ${quoteUrl}`;

        switch (method) {
            case 'email':
                const subject = `Travel Quote for ${destination} - VoyageGen`;
                const body = encodeURIComponent(message);
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
                break;

            case 'whatsapp':
                const whatsappMessage = encodeURIComponent(message);
                window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
                break;

            case 'instagram':
                // Instagram doesn't support direct sharing via URL, so copy to clipboard
                navigator.clipboard.writeText(message).then(() => {
                    alert('Quote details copied to clipboard! You can now paste it on Instagram.');
                }).catch(() => {
                    alert('Please copy this message manually:\n\n' + message);
                });
                break;
        }

        setShareDropdown(null); // Close dropdown after sharing
    };

    const deleteQuote = async (quoteId) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/quotes/${quoteId}`, config);

            // Remove from local state
            setQuotes(quotes.filter(q => q._id !== quoteId));
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Failed to delete quote');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-4xl text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold mb-2">Generated Quotes</h1>
                <p className="text-gray-400">Manage and view all generated quotations</p>
            </div>

            {quotes.length === 0 ? (
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-12 text-center">
                    <FaFileInvoice className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Quotes Generated Yet</h3>
                    <p className="text-gray-400 mb-6">Start by selecting partners from requirements</p>
                    <button
                        onClick={() => navigate('/agent/dashboard')}
                        className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quotes.map(quote => (
                        <div
                            key={quote._id}
                            className="bg-zinc-900 border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{quote.requirementId?.contactInfo?.name || 'Traveler'}</h3>
                                    <p className="text-sm text-gray-400">
                                        Quote #{quote._id.slice(-6)} • {quote.requirementId?.destination || 'N/A'}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${quote.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' :
                                    quote.status === 'SENT_TO_USER' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                    {quote.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Total Price</p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        ₹{quote.costs?.final?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Hotels</p>
                                    <p className="text-lg font-bold">{quote.sections?.hotels?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Activities</p>
                                    <p className="text-lg font-bold">{quote.sections?.activities?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transport</p>
                                    <p className="text-lg font-bold">{quote.sections?.transport?.length || 0}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/agent/quote/${quote._id}`)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    <FaEye /> View Details
                                </button>
                                <button
                                    onClick={() => downloadPDF(quote)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                                >
                                    <FaDownload /> Download PDF
                                </button>

                                {/* Share Button with Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShareDropdown(shareDropdown === quote._id ? null : quote._id)}
                                        className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                                    >
                                        <FaShare /> Share
                                    </button>

                                    {shareDropdown === quote._id && (
                                        <div className="absolute right-0 top-full mt-2 bg-zinc-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 min-w-[180px]">
                                            <button
                                                onClick={() => handleShare(quote, 'email')}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
                                            >
                                                <FaEnvelope className="text-red-400" />
                                                <span>Email</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare(quote, 'whatsapp')}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left border-t border-white/5"
                                            >
                                                <FaWhatsapp className="text-green-400" />
                                                <span>WhatsApp</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare(quote, 'instagram')}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left border-t border-white/5"
                                            >
                                                <FaInstagram className="text-pink-400" />
                                                <span>Instagram</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => deleteQuote(quote._id)}
                                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                                    title="Delete Quote"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuotesList;
