import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaFileInvoice, FaEye, FaDownload, FaSpinner, FaTrash, FaShare, FaEnvelope, FaWhatsapp, FaInstagram, FaQuoteRight, FaCalendarAlt, FaMapMarkedAlt } from 'react-icons/fa';

const QuotesList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareDropdown, setShareDropdown] = useState(null);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotes`, config);
                // Handle paginated response format
                setQuotes(res.data.data || res.data);
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
                    .ai-badge {
                        background: linear-gradient(135deg, #a855f7, #ec4899);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        margin-left: 8px;
                        vertical-align: middle;
                    }
                    .ai-row td {
                        background: rgba(168, 85, 247, 0.05);
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
                                <tr class="${hotel.source === 'AI' ? 'ai-row' : ''}">
                                    <td class="item-name">
                                        ${hotel.name}
                                        ${hotel.source === 'AI' ? '<span class="ai-badge">Live Market</span>' : ''}
                                    </td>
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
                                <tr class="${transport.source === 'AI' ? 'ai-row' : ''}">
                                    <td class="item-name">
                                        ${transport.vehicleType}
                                        ${transport.source === 'AI' ? '<span class="ai-badge">Live Market</span>' : ''}
                                    </td>
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

                        ${quote.itineraryText ? `
                        <div class="section">
                            <h2 class="section-title">
                                <span class="section-icon">✨</span>
                                AI Generated Itinerary
                            </h2>
                            <div style="background: #18181b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 20px;">
                                <pre style="font-family: 'Inter', sans-serif; white-space: pre-wrap; line-height: 1.6; color: #e4e4e7; font-size: 14px; margin: 0;">
${quote.itineraryText}
                                </pre>
                            </div>
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
            <div className="flex items-center justify-center h-[70vh] text-emerald-400">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto animate-enter">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Quote Gallery</h1>
                    <p className="text-gray-400 text-lg font-light">Manage and distribute your travel proposals</p>
                </div>
                <div className="bg-zinc-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Quotes</span>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-emerald-400 font-bold text-xl font-serif">{quotes.length}</span>
                </div>
            </div>

            {quotes.length === 0 ? (
                <div className="glass-card rounded-xl p-16 text-center border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-800 relative group">
                        <FaQuoteRight className="text-4xl text-zinc-600 group-hover:text-zinc-400 transition-colors relative z-10" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white mb-3">Canvas Empty</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">No quotes generated yet. Start by creating a requirement and running the agent.</p>
                    <button
                        onClick={() => navigate('/agent')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <FaFileInvoice /> View Requirements
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {quotes.map((quote, index) => (
                        <div
                            key={quote._id}
                            className="glass-card rounded-xl p-6 transition-all group flex flex-col h-full hover:bg-zinc-900/60 hover:border-zinc-700 border-zinc-800/50 animate-enter"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Card Header & Badges */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500 font-mono tracking-tighter">#{quote._id.slice(-6)}</span>
                                    {quote.agentRunId && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/10 w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">AI Generated</span>
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${quote.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' :
                                    quote.status === 'SENT_TO_USER' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                                    }`}>
                                    {quote.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* Main Content */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-serif font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {quote.requirementId?.contactInfo?.name || 'Traveler'}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <FaMapMarkedAlt className="text-zinc-500" />
                                    <span>{quote.requirementId?.destination || 'Global Request'}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-zinc-800 mb-6" />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Package</p>
                                    <p className="text-emerald-500/80 font-bold text-lg font-mono">₹{quote.costs?.final?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Duration</p>
                                    <p className="text-white font-bold text-lg flex items-center gap-2">
                                        <FaCalendarAlt className="text-zinc-600 text-sm" />
                                        {quote.requirementId?.duration || 'N/A'} Days
                                    </p>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="mt-auto flex gap-3 pt-2">
                                <button
                                    onClick={() => navigate(`/agent/quote/${quote._id}`)}
                                    className="flex-1 bg-zinc-100 text-zinc-900 py-3 rounded-lg font-bold text-sm hover:bg-white transition-all shadow-sm hover:shadow-md"
                                >
                                    Details
                                </button>

                                <button
                                    onClick={() => downloadPDF(quote)}
                                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
                                    title="Download PDF"
                                >
                                    <FaDownload />
                                </button>

                                {/* Share Dropdown Wrapper */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShareDropdown(shareDropdown === quote._id ? null : quote._id)}
                                        className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-all ${shareDropdown === quote._id
                                            ? 'bg-zinc-800 text-white border-zinc-700'
                                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                                            }`}
                                        title="Share"
                                    >
                                        <FaShare />
                                    </button>

                                    {shareDropdown === quote._id && (
                                        <div className="absolute right-0 bottom-full mb-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-20 min-w-[180px] animate-enter origin-bottom-right">
                                            <button
                                                onClick={() => handleShare(quote, 'email')}
                                                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-800 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white"
                                            >
                                                <FaEnvelope className="text-red-400/80" /> Email
                                            </button>
                                            <div className="h-px bg-zinc-800" />
                                            <button
                                                onClick={() => handleShare(quote, 'whatsapp')}
                                                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-800 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white"
                                            >
                                                <FaWhatsapp className="text-emerald-400/80" /> WhatsApp
                                            </button>
                                            <div className="h-px bg-zinc-800" />
                                            <button
                                                onClick={() => handleShare(quote, 'instagram')}
                                                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-800 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white"
                                            >
                                                <FaInstagram className="text-pink-400/80" /> Instagram
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => deleteQuote(quote._id)}
                                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg border border-zinc-800 hover:border-red-500/20 transition-all"
                                    title="Delete"
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
