/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit } from 'lucide-react';

interface EditableInfoRowProps {
  label: string;
  value?: any;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { id: string; label: string }[];
  onSave: (newValue: any) => Promise<void> | void;
  disabled?: boolean;
}

const EditableInfoRow: React.FC<EditableInfoRowProps> = ({
  label,
  value,
  type = 'text',
  options,
  onSave,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<any>(value ?? '');

  useEffect(() => {
    setTemp(value ?? (type === 'number' ? 0 : ''));
  }, [value, type]);

  const save = async () => {
    await onSave(temp);
    setEditing(false);
  };

  return (
    <div className="grid grid-cols-3 gap-4 items-start py-2">
      <div className="text-sm text-muted-foreground col-span-1">{label}</div>
      <div className="col-span-2">
        {!editing ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">{value ?? '—'}</div>
            {!disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {type === 'text' && (
              <Input
                value={temp ?? ''}
                onChange={(e) => setTemp(e.target.value)}
                className="max-w-md"
              />
            )}
            {type === 'number' && (
              <Input
                type="number"
                value={temp ?? 0}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="max-w-md"
              />
            )}
            {type === 'date' && (
              <DatePickerField
                value={temp ? temp : ''}
                onChange={(d) => setTemp(d || '')}
              />
            )}
            {type === 'textarea' && (
              <Textarea
                value={temp ?? ''}
                onChange={(e) => setTemp(e.target.value)}
                className="min-h-[80px]"
              />
            )}
            {type === 'select' && (
              <Select value={temp} onValueChange={setTemp}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder={value ?? '—'} />
                </SelectTrigger>
                <SelectContent>
                  {(options || []).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button size="sm" onClick={save} className="gap-1">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setTemp(value);
              }}
              className="gap-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableInfoRow;

