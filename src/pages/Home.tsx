import FileUpload from "@/components/FileUpload";
import ShredderMachine from "@/components/ShredderMachine";
import ShredderControls from "@/components/ShredderControls";
import HelpModal from "@/components/HelpModal";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center font-nunito">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-primary text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-accent animate-wiggle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-extrabold">Shreddit</h1>
          </div>
          <HelpModal />
        </div>
      </header>
      
      <main className="container mx-auto flex-grow px-4 py-8 flex flex-col items-center">
        <FileUpload />
        <ShredderMachine />
        <ShredderControls />
      </main>
    </div>
  );
};

export default Home;
