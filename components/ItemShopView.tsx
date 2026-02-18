import React from 'react';
import { ArrowLeft, Store, ShoppingCart, Gem } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { SHOP_ITEMS } from '../constants';
import { useError } from '../contexts/ErrorContext';
import type { ShopItem } from '../types';

interface ItemShopViewProps {
  onBack: () => void;
}

const ItemShopView: React.FC<ItemShopViewProps> = ({ onBack }) => {
  const { userProgress, purchaseItem } = useData();
  const { logError } = useError();

  const handlePurchase = (item: ShopItem) => {
      if ((userProgress?.coins || 0) < item.price) {
          logError('Coins ไม่เพียงพอ!', 'warning');
          return;
      }
      purchaseItem(item);
  };

  const purchasedItems = userProgress?.purchasedItems;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Store className="text-amber-500" size={32}/> Item Shop
          </h1>
          <p className="text-slate-500 text-sm">ใช้ Coins ที่สะสมมาแลกของรางวัลสุดพิเศษ!</p>
        </div>
      </header>
      
      <div className="bg-white/50 p-4 rounded-3xl border border-white mb-6 flex items-center justify-between shadow-sm">
          <div className="px-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Your Coins</p>
              <p className="text-3xl font-black text-amber-600 flex items-center gap-2">
                  <Gem size={24}/> {userProgress?.coins || 0}
              </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold bg-slate-800 text-white px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              <ShoppingCart size={16}/> My Items
          </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOP_ITEMS.map(item => {
                const isOwned = (item.type === 'theme' && purchasedItems?.themes?.includes(item.id)) || (item.type === 'frame' && purchasedItems?.frames?.includes(item.id));
                return (
                    <div 
                        key={item.id}
                        className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col text-center shadow-md
                            ${isOwned ? 'bg-slate-100 border-slate-200' : 'bg-white border-transparent hover:shadow-xl hover:-translate-y-1'}
                        `}
                    >
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto border-4 border-white shadow-inner ${item.value}`}>
                            🎨
                        </div>
                        <h3 className={`font-bold text-lg ${isOwned ? 'text-slate-500' : 'text-slate-800'}`}>{item.name}</h3>
                        <p className={`text-xs mt-1 h-8 ${isOwned ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                        
                        <div className="mt-auto pt-4">
                            <button 
                                onClick={() => handlePurchase(item)}
                                disabled={isOwned}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                                    ${isOwned 
                                        ? 'bg-green-200 text-green-800 cursor-default' 
                                        : 'bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-lg hover:scale-105'}
                                `}
                            >
                                {isOwned ? 'เป็นเจ้าของแล้ว' : (
                                    <>
                                        <Gem size={14}/> {item.price} Coins
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ItemShopView;