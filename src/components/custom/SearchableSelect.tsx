// src/components/common/SearchableSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';

interface SearchableSelectProps {
  route: string;
  nameField: string;
  valueField?: string;
  placeholder?: string;
  value?: number | null;
  onChange: (value: number | null, item?: any) => void;
  className?: string;
  disabled?: boolean;
}

interface ItemType {
  [key: string]: any;
}

const SearchableSelect = ({
                            route,
                            nameField,
                            valueField = 'id',
                            placeholder = 'Select an item...',
                            value,
                            onChange,
                            className,
                            disabled = false
                          }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(route);
        if (response.data.success && Array.isArray(response.data.data)) {
          setItems(response.data.data);
          setFilteredItems(response.data.data);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [route]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item[nameField].toLowerCase().includes(search.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [search, items, nameField]);

  const selectedItem = items.find(item => item[valueField] === value);

  const handleSelect = (selectedValue: number) => {
    const item = items.find(item => item[valueField] === selectedValue);
    if (value === selectedValue) {
      onChange(null);
    } else {
      onChange(selectedValue, item);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem
            ? selectedItem[nameField]
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading...</div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-red-500">{error}</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm">No items found</div>
            ) : (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item[valueField]}
                    value={item[valueField].toString()}
                    onSelect={() => handleSelect(item[valueField])}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item[valueField] ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item[nameField]}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;