// Emoji Icon Components - Replaces lucide-react icons with emojis for better aesthetics
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  strokeWidth?: number;
}

// Helper to create emoji icon component
const createEmojiIcon = (emoji: string) => {
  const IconComponent: React.FC<IconProps> = ({ size = 16, className = '', style = {} }) => (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        ...style
      }}
      role="img"
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
  return IconComponent;
};

// Navigation
export const CheckSquare = createEmojiIcon('☑️');
export const Square = createEmojiIcon('⬜');
export const LogOut = createEmojiIcon('🚪');
export const LogIn = createEmojiIcon('🚪');
export const Wifi = createEmojiIcon('📶');
export const WifiOff = createEmojiIcon('📵');
export const Layout = createEmojiIcon('📐');
export const Menu = createEmojiIcon('☰');
export const X = createEmojiIcon('✕');
export const ChevronRight = createEmojiIcon('▶');
export const ChevronLeft = createEmojiIcon('◀');
export const ChevronUp = createEmojiIcon('▲');
export const ChevronDown = createEmojiIcon('▼');
export const ArrowRight = createEmojiIcon('→');
export const ArrowLeft = createEmojiIcon('←');
export const ArrowUp = createEmojiIcon('↑');
export const ArrowDown = createEmojiIcon('↓');
export const ArrowUpDown = createEmojiIcon('↕️');

// Education
export const Book = createEmojiIcon('📚');
export const BookOpen = createEmojiIcon('📖');
export const Bookmark = createEmojiIcon('🔖');
export const PenTool = createEmojiIcon('✏️');
export const Pencil = createEmojiIcon('✏️');
export const Edit = createEmojiIcon('✏️');
export const Edit2 = createEmojiIcon('✏️');
export const Edit3 = createEmojiIcon('✏️');
export const Eraser = createEmojiIcon('🧹');
export const PenLine = createEmojiIcon('✏️');
export const FileSignature = createEmojiIcon('📝');
export const UploadCloud = createEmojiIcon('☁️');
export const BellOff = createEmojiIcon('🔕');
export const BookA = createEmojiIcon('📚');
export const GitCompare = createEmojiIcon('🔀');
export const Bike = createEmojiIcon('🚲');
export const GitCommit = createEmojiIcon('📝');
export const MousePointer = createEmojiIcon('👆');
export const MousePointer2 = createEmojiIcon('👆');
export const Scale = createEmojiIcon('⚖️');
export const Power = createEmojiIcon('⚡');
export const MonitorPlay = createEmojiIcon('🖥️');
export const Youtube = createEmojiIcon('📺');
export const Swords = createEmojiIcon('⚔️');
export const Gem = createEmojiIcon('💎');
export const FolderOpen = createEmojiIcon('📂');
export const Folder = createEmojiIcon('📁');
export const FolderPlus = createEmojiIcon('📁➕');
export const FileText = createEmojiIcon('📄');
export const File = createEmojiIcon('📄');
export const StickyNote = createEmojiIcon('📝');
export const Clipboard = createEmojiIcon('📋');
export const ClipboardCheck = createEmojiIcon('✅');
export const ClipboardList = createEmojiIcon('📋');
export const Notebook = createEmojiIcon('📓');
export const Calendar = createEmojiIcon('📅');

// Users
export const UserCircle = createEmojiIcon('👤');
export const User = createEmojiIcon('👤');
export const Users = createEmojiIcon('👥');
export const UserPlus = createEmojiIcon('➕👤');
export const UserMinus = createEmojiIcon('➖👤');
export const UserPlusIcon = createEmojiIcon('➕👤');

// Communication
export const MessageSquare = createEmojiIcon('💬');
export const Mail = createEmojiIcon('✉️');
export const Send = createEmojiIcon('📤');
export const Bell = createEmojiIcon('🔔');

// Actions
export const Search = createEmojiIcon('🔍');
export const Plus = createEmojiIcon('➕');
export const PlusSquare = createEmojiIcon('➕');
export const Minus = createEmojiIcon('➖');
export const Trash2 = createEmojiIcon('🗑️');
export const Trash = createEmojiIcon('🗑️');
export const Download = createEmojiIcon('⬇️');
export const Upload = createEmojiIcon('⬆️');
export const RefreshCw = createEmojiIcon('🔄');
export const Refresh = createEmojiIcon('🔄');
export const RotateCcw = createEmojiIcon('↩️');
export const Undo = createEmojiIcon('↩️');
export const Redo = createEmojiIcon('↪️');
export const Save = createEmojiIcon('💾');

// Additional aliases for icons expected by components
export const ListOrdered = createEmojiIcon('🔢');
export const PlusCircle = createEmojiIcon('➕');
export const MessageCircle = createEmojiIcon('💬');
export const Globe = createEmojiIcon('🌐');
export const MousePointerClick = createEmojiIcon('🖱️');
export const Scissors = createEmojiIcon('✂️');
export const Filter = createEmojiIcon('🔍');

// Status
export const Check = createEmojiIcon('✓');
export const CheckCircle = createEmojiIcon('✅');
export const CheckCircle2 = createEmojiIcon('✅');
export const Circle = createEmojiIcon('⭕');
export const XCircle = createEmojiIcon('❌');
export const AlertTriangle = createEmojiIcon('⚠️');
export const AlertTriangleIcon = createEmojiIcon('⚠️');
export const AlertCircle = createEmojiIcon('⚠️');
export const Info = createEmojiIcon('ℹ️');
export const HelpCircle = createEmojiIcon('❓');
export const Loader2 = createEmojiIcon('⏳');
export const Loader = createEmojiIcon('⏳');
export const Clock = createEmojiIcon('⏰');
export const Timer = createEmojiIcon('⏱️');
export const Hourglass = createEmojiIcon('⏳');

// Security
export const Lock = createEmojiIcon('🔒');
export const Unlock = createEmojiIcon('🔓');
export const KeyRound = createEmojiIcon('🔑');
export const Key = createEmojiIcon('🔑');
export const Shield = createEmojiIcon('🛡️');
export const ShieldAlert = createEmojiIcon('⚠️');
export const ShieldCheck = createEmojiIcon('✅');
export const Eye = createEmojiIcon('👁️');
export const EyeOff = createEmojiIcon('🚫');
export const ScanFace = createEmojiIcon('👤');

// Media
export const Music = createEmojiIcon('🎵');
export const Play = createEmojiIcon('▶️');
export const Pause = createEmojiIcon('⏸️');
export const SkipForward = createEmojiIcon('⏭️');
export const SkipBack = createEmojiIcon('⏮️');
export const Video = createEmojiIcon('🎬');
export const Camera = createEmojiIcon('📷');
export const Mic = createEmojiIcon('🎤');
export const Image = createEmojiIcon('🖼️');

// Analytics
export const BarChart = createEmojiIcon('📊');
export const BarChart3 = createEmojiIcon('📊');
export const BarChart2 = createEmojiIcon('📊');
export const PieChart = createEmojiIcon('🥧');
export const TrendingUp = createEmojiIcon('📈');
export const TrendingDown = createEmojiIcon('📉');
export const Activity = createEmojiIcon('📈');
export const LineChart = createEmojiIcon('📉');
export const FileSpreadsheet = createEmojiIcon('📊');

// Objects
export const Zap = createEmojiIcon('⚡');
export const Lightbulb = createEmojiIcon('💡');
export const Star = createEmojiIcon('⭐');
export const Sparkles = createEmojiIcon('✨');
export const Trophy = createEmojiIcon('🏆');
export const Award = createEmojiIcon('🏅');
export const Medal = createEmojiIcon('🥇');
export const Crown = createEmojiIcon('👑');
export const Gift = createEmojiIcon('🎁');
export const Package = createEmojiIcon('📦');
export const Box = createEmojiIcon('📦');
export const Layers = createEmojiIcon('🥞');
export const Briefcase = createEmojiIcon('💼');

// Shopping
export const ShoppingBag = createEmojiIcon('🛍️');
export const ShoppingCart = createEmojiIcon('🛒');
export const Store = createEmojiIcon('🏪');
export const CreditCard = createEmojiIcon('💳');
export const Wallet = createEmojiIcon('👛');
export const DollarSign = createEmojiIcon('💵');
export const Coins = createEmojiIcon('🪙');

// Settings
export const Settings = createEmojiIcon('⚙️');
export const Cog = createEmojiIcon('⚙️');
export const Sliders = createEmojiIcon('🎚️');
export const FilterIcon = createEmojiIcon('🔍');
export const SortIcon = createEmojiIcon('↕️');

// Arrows
export const Move = createEmojiIcon('↔️');
export const MoveUp = createEmojiIcon('⬆️');
export const MoveDown = createEmojiIcon('⬇️');
export const MoveLeft = createEmojiIcon('⬅️');
export const MoveRight = createEmojiIcon('➡️');
export const Maximize = createEmojiIcon('□');
export const Minimize = createEmojiIcon('▪');
export const Maximize2 = createEmojiIcon('□');
export const Minimize2 = createEmojiIcon('▪');

// Weather
export const Sun = createEmojiIcon('☀️');
export const Moon = createEmojiIcon('🌙');
export const Cloud = createEmojiIcon('☁️');
export const CloudRain = createEmojiIcon('🌧️');
export const Umbrella = createEmojiIcon('☂️');

// Tech
export const Monitor = createEmojiIcon('🖥️');
export const Smartphone = createEmojiIcon('📱');
export const Tablet = createEmojiIcon('📲');
export const Laptop = createEmojiIcon('💻');
export const Desktop = createEmojiIcon('🖥️');
export const Tv = createEmojiIcon('📺');
export const Bluetooth = createEmojiIcon('🔵');
export const Battery = createEmojiIcon('🔋');
export const BatteryCharging = createEmojiIcon('⚡');
export const Plug = createEmojiIcon('🔌');
export const Cpu = createEmojiIcon('🖥️');
export const Database = createEmojiIcon('🗄️');
export const Server = createEmojiIcon('🖥️');
export const HardDrive = createEmojiIcon('💾');
export const Disc = createEmojiIcon('💿');
export const Code = createEmojiIcon('💻');
export const Code2 = createEmojiIcon('💻');
export const Terminal = createEmojiIcon('⌨️');
export const Bot = createEmojiIcon('🤖');
export const Brain = createEmojiIcon('🧠');
export const BrainCircuit = createEmojiIcon('🧠');

// Home
export const Home = createEmojiIcon('🏠');
export const House = createEmojiIcon('🏠');
export const Building = createEmojiIcon('🏢');
export const School = createEmojiIcon('🏫');
export const Hospital = createEmojiIcon('🏥');
export const Bank = createEmojiIcon('🏦');
export const Factory = createEmojiIcon('🏭');
export const Hotel = createEmojiIcon('🏨');

// Food
export const Coffee = createEmojiIcon('☕');
export const CoffeeIcon = createEmojiIcon('☕');
export const Utensils = createEmojiIcon('🍽️');
export const Pizza = createEmojiIcon('🍕');
export const Burger = createEmojiIcon('🍔');
export const IceCream = createEmojiIcon('🍦');
export const Cake = createEmojiIcon('🎂');
export const Apple = createEmojiIcon('🍎');

// Sports/Games
export const Gamepad = createEmojiIcon('🎮');
export const Target = createEmojiIcon('🎯');
export const Flag = createEmojiIcon('🚩');

// Heart
export const Heart = createEmojiIcon('❤️');
export const HeartPulse = createEmojiIcon('💓');
export const Stethoscope = createEmojiIcon('🩺');
export const Pill = createEmojiIcon('💊');
export const Bandage = createEmojiIcon('🩹');

// Tools
export const Wrench = createEmojiIcon('🔧');
export const Hammer = createEmojiIcon('🔨');

// Math
export const GitMerge = createEmojiIcon('🔀');
export const Car = createEmojiIcon('🚗');
export const History = createEmojiIcon('📜');
export const Palette = createEmojiIcon('🎨');
export const Wind = createEmojiIcon('💨');
export const Droplet = createEmojiIcon('💧');
export const Puzzle = createEmojiIcon('🧩');
export const Ruler = createEmojiIcon('📏');
export const Microscope = createEmojiIcon('🔬');
export const Telescope = createEmojiIcon('🔭');
export const Flask = createEmojiIcon('🧪');

// Social
export const Share = createEmojiIcon('🔗');
export const Share2 = createEmojiIcon('🔗');
export const Link = createEmojiIcon('🔗');
export const LinkIcon = createEmojiIcon('🔗');
export const Unlink = createEmojiIcon('✂️');
export const Paperclip = createEmojiIcon('📎');
export const AtSign = createEmojiIcon('@');
export const Hash = createEmojiIcon('#️⃣');
export const Command = createEmojiIcon('⌘');

// Gestures
export const ThumbsUp = createEmojiIcon('👍');
export const ThumbsDown = createEmojiIcon('👎');
export const PointUp = createEmojiIcon('👆');
export const PointDown = createEmojiIcon('👇');
export const PointLeft = createEmojiIcon('👈');
export const PointRight = createEmojiIcon('👉');
export const Peace = createEmojiIcon('✌️');
export const OkHand = createEmojiIcon('👌');
export const Wave = createEmojiIcon('👋');
export const Clap = createEmojiIcon('👏');
export const Pray = createEmojiIcon('🙏');
export const Muscle = createEmojiIcon('💪');

// Animals
export const Dog = createEmojiIcon('🐕');
export const Cat = createEmojiIcon('🐈');
export const Bird = createEmojiIcon('🐦');
export const Fish = createEmojiIcon('🐟');
export const Bug = createEmojiIcon('🐛');
export const Butterfly = createEmojiIcon('🦋');
export const Snail = createEmojiIcon('🐌');
export const Turtle = createEmojiIcon('🐢');
export const Rabbit = createEmojiIcon('🐇');
export const Mouse = createEmojiIcon('🐁');

// Nature
export const Flower = createEmojiIcon('🌸');
export const Flower2 = createEmojiIcon('🌺');
export const Rose = createEmojiIcon('🌹');
export const Sunflower = createEmojiIcon('🌻');
export const Tulip = createEmojiIcon('🌷');
export const Tree = createEmojiIcon('🌳');
export const TreeDeciduous = createEmojiIcon('🌳');
export const TreePine = createEmojiIcon('🌲');
export const PalmTree = createEmojiIcon('🌴');
export const Cactus = createEmojiIcon('🌵');
export const Leaf = createEmojiIcon('🍃');
export const Leaves = createEmojiIcon('🍂');
export const Mushroom = createEmojiIcon('🍄');
export const Sprout = createEmojiIcon('🌱');
export const Seedling = createEmojiIcon('🌱');
export const Herb = createEmojiIcon('🌿');

// Space
export const Rocket = createEmojiIcon('🚀');
export const Ufo = createEmojiIcon('🛸');
export const Satellite = createEmojiIcon('🛰️');
export const Planet = createEmojiIcon('🪐');
export const Comet = createEmojiIcon('☄️');
export const Rainbow = createEmojiIcon('🌈');

// Additional
export const MoreHorizontal = createEmojiIcon('⋯');
export const MoreVertical = createEmojiIcon('⋮');
export const GripVertical = createEmojiIcon('⋮');
export const GripHorizontal = createEmojiIcon('⋯');
export const LayoutGrid = createEmojiIcon('▦');
export const LayoutList = createEmojiIcon('☰');
export const List = createEmojiIcon('☰');
export const Grid = createEmojiIcon('▦');
export const Printer = createEmojiIcon('🖨️');
export const Phone = createEmojiIcon('📞');
export const Inbox = createEmojiIcon('📥');
export const ExternalLink = createEmojiIcon('↗️');
export const Fullscreen = createEmojiIcon('⛶');
export const Sidebar = createEmojiIcon('▧');
export const PanelLeft = createEmojiIcon('▧');
export const PanelRight = createEmojiIcon('▨');
export const PlayCircle = createEmojiIcon('▶️');
export const Flame = createEmojiIcon('🔥');
export const BookIcon = createEmojiIcon('�');
export const GraduationCap = createEmojiIcon('🎓');
export const Chalkboard = createEmojiIcon('📋');
export const LayoutDashboard = createEmojiIcon('📊');

// Icon aliases for common variations
export const SearchIcon = Search;
export const PlusIcon = Plus;
export const MinusIcon = Minus;
export const XIcon = X;
export const CheckIcon = Check;
export const CheckCircleIcon = CheckCircle;
export const AlertCircleIcon = AlertCircle;
export const InfoIcon = Info;
export const HelpCircleIcon = HelpCircle;
export const TrashIcon = Trash2;
export const EditIcon = Edit;
export const SaveIcon = Save;
export const DownloadIcon = Download;
export const UploadIcon = Upload;
export const RefreshIcon = RefreshCw;
export const CloseIcon = X;
export const MenuIcon = Menu;
export const HomeIcon = Home;
export const UserIcon = User;
export const UsersIcon = Users;
export const SettingsIcon = Settings;
export const MoreIcon = MoreHorizontal;
export const BackIcon = ChevronLeft;
export const NextIcon = ChevronRight;
export const PreviousIcon = ChevronLeft;
export const ForwardIcon = ChevronRight;