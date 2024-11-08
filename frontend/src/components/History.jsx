import { BsArrowLeft } from 'react-icons/bs';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex justify-center font-poppins">
      <div className=" bg-black text-white w-full max-w-lg flex flex-col px-4">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="text-2xl text-white">
            <BsArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-center flex-grow">Transaction History</h2>
        </div>
        
        {/* Scrollable Transaction List */}
        <div className="flex-grow overflow-y-auto py-4">
          {/* Sample Data by Date */}
          {[
            { date: 'Nov 7, 2024', transactions: [200, 150, 300] },
            { date: 'Nov 6, 2024', transactions: [100, 250] },
            { date: 'Nov 5, 2024', transactions: [50, 120, 300] },
          ].map((section, index) => (
            <div key={index} className="mb-6">
              {/* Date Label */}
              <p className="text-sm font-semibold text-gray-400 mb-3">{section.date}</p>
              {/* Transaction Items as Simple Rows */}
              {section.transactions.map((amount, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 ">
                  <div className="flex items-center space-x-3">
                    <img
                      className="w-8 h-8"
                      src="/src/Img/rupees.png"
                      alt="Transaction icon"
                    />
                    <h3 className="text-sm font-semibold">Receive from daily rewards</h3>
                  </div>
                  <p className={`text-sm font-medium ${amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {amount > 0 ? `+ ${amount} Coins` : `${amount} Coins`}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default TransactionHistory;
