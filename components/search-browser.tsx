"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

interface SearchBrowserProps {
  onSearch?: (searchtext: string) => void;
}
export function SearchBrowser({onSearch} : SearchBrowserProps) {
      const [searchText, setSearchText] = useState("")
    
    return (

        <div className="flex space-x-2">
            <Input 
              id="searchText" 
              value={searchText}
              className=" w-full" 
              placeholder="Search your file.."
              onChange={(e) => setSearchText(e.target.value)} 
            />
            
          <Button 
          variant={'outline'}
            className="justify-center gap-2 "
            onClick={() => onSearch?.(searchText)}
          >
            Search
            <SearchIcon className="size-4" />
          </Button>
        </div>
    //     </div>
    // </div>
    )
}