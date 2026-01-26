import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormSchema} from '../consts/rule';
import {FormSchemaType} from '../model/type';
import {Category, CATEGORY_LIST} from '@/entities/review';
import {Form, FormControl, FormField, FormItem, FormMessage} from '@/shared/shadcnComponent/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/shadcnComponent/ui/select';
import {Input} from '@/shared/shadcnComponent/ui/input';

type Props = {
  onSubmit: (values: FormSchemaType) => void;
  initialTitle?: string;
  initialCategory?: Category;
};

export default function EditorMetaForm({onSubmit, initialTitle, initialCategory}: Props) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: initialTitle || '',
      category: initialCategory || undefined,
    },
  });

  const selectableCategories = CATEGORY_LIST.filter(category => category.value !== 'all');

  return (
    <Form {...form}>
      <form
        className="flex flex-col px-2 gap-1"
        id="editor-meta-form"
        aria-label="meta-data-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="category"
          render={({field}) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[120px] shadow-none border-none focus:outline-none outline-none focus:ring-0 selection:outline-none">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectableCategories.map(({id, value, label}) => (
                    <SelectItem key={id} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem className="ml-3">
              <FormControl>
                <Input
                  className="text-2xl md:text-3xl py-2 border-none focus:outline-none"
                  spellCheck="false"
                  placeholder="제목을 입력하세요"
                  {...field}
                />
              </FormControl>
              <div className="w-[70px] h-[3px] bg-boldBlue" />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
