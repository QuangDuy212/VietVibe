// import { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import { BookOpen, Edit, Trash2, Plus } from "lucide-react";

// import {
//   callGetAllVocabulary,
//   callCreateVocabulary,
//   callUpdateVocabulary,
//   callDeleteVocabulary,
//   callFetchLessons, // ✅ THÊM
// } from "@/config/api";

// import { IVocabulary } from "@/types/common.type";

// const VocabularyManagement = () => {
//   const [vocabularies, setVocabularies] = useState<IVocabulary[]>([]);
//   const [lessons, setLessons] = useState<any[]>([]); // ✅ THÊM
//   const [loading, setLoading] = useState(true);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<IVocabulary | null>(null);

//   const [form, setForm] = useState({
//     word: "",
//     englishMeaning: "",
//     exampleSentence: "",
//     lessonId: "", // ✅ BẮT BUỘC
//   });

//   const fetchVocabulary = async () => {
//     try {
//       setLoading(true);
//       const res = await callGetAllVocabulary();
//       setVocabularies(res.data?.data || []);
//     } catch (err) {
//       toast.error("Lấy danh sách từ vựng thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLessons = async () => {
//     const res = await callFetchLessons();
//     setLessons(res.data?.data || []);
//   };

//   useEffect(() => {
//     fetchVocabulary();
//     fetchLessons(); // ✅ LOAD LESSON
//   }, []);

//   const openCreate = () => {
//     setEditing(null);
//     setForm({
//       word: "",
//       englishMeaning: "",
//       exampleSentence: "",
//       lessonId: "", // ✅ RESET
//     });
//     setDialogOpen(true);
//   };

//   const openEdit = (v: IVocabulary) => {
//     setEditing(v);
//     setForm({
//       word: v.word,
//       englishMeaning: v.englishMeaning,
//       exampleSentence: v.exampleSentence,
//       lessonId:
//         typeof v.lessonId === "string" ? v.lessonId : v.lessonId?._id || "",
//     });
//     setDialogOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       if (!form.word.trim() || !form.englishMeaning.trim() || !form.lessonId) {
//         toast.error("Vui lòng nhập đầy đủ thông tin");
//         return;
//       }

//       if (editing) {
//         await callUpdateVocabulary(editing._id, form);
//         toast.success("Cập nhật thành công");
//       } else {
//         await callCreateVocabulary(form); // ✅ GIỜ CÓ lessonId
//         toast.success("Thêm mới thành công");
//       }

//       setDialogOpen(false);
//       fetchVocabulary();
//     } catch (err) {
//       toast.error("Thao tác thất bại");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await callDeleteVocabulary(id);
//       toast.success("Xóa thành công");
//       fetchVocabulary();
//     } catch (err) {
//       toast.error("Xóa thất bại");
//     }
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-8 text-center">Loading...</CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card className="border-0 shadow-xl">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <BookOpen className="w-5 h-5" /> Vocabulary Management
//               </CardTitle>
//               <CardDescription>
//                 Total vocabularies: {vocabularies.length}
//               </CardDescription>
//             </div>

//             <Button onClick={openCreate} className="flex gap-2">
//               <Plus className="w-4 h-4" />
//               Add new
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <div className="rounded-xl border overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/50">
//                   <TableHead>Word</TableHead>
//                   <TableHead>Meaning</TableHead>
//                   <TableHead>Example</TableHead>
//                   <TableHead className="text-center">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {vocabularies.map((v) => (
//                   <TableRow key={v._id}>
//                     <TableCell className="font-semibold">{v.word}</TableCell>
//                     <TableCell>{v.englishMeaning}</TableCell>
//                     <TableCell>{v.exampleSentence}</TableCell>
//                     <TableCell className="text-center">
//                       <div className="flex justify-center gap-3">
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => openEdit(v)}
//                         >
//                           <Edit className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => handleDelete(v._id)}
//                         >
//                           <Trash2 className="w-4 h-4 text-red-600" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Dialog Create / Update */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {editing ? "Update Vocabulary" : "Create Vocabulary"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             {/* ✅ SELECT LESSON */}
//             <div>
//               <Label>Lesson</Label>
//               <select
//                 className="w-full border rounded-md h-10 px-3"
//                 value={form.lessonId}
//                 onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
//               >
//                 <option value="">-- Chọn bài học --</option>
//                 {lessons.map((lesson) => (
//                   <option key={lesson._id} value={lesson._id}>
//                     {lesson.lessontitle}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <Label>Word</Label>
//               <Input
//                 value={form.word}
//                 onChange={(e) => setForm({ ...form, word: e.target.value })}
//               />
//             </div>

//             <div>
//               <Label>Meaning</Label>
//               <Input
//                 value={form.englishMeaning}
//                 onChange={(e) =>
//                   setForm({ ...form, englishMeaning: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <Label>Example</Label>
//               <Input
//                 value={form.exampleSentence}
//                 onChange={(e) =>
//                   setForm({ ...form, exampleSentence: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave}>
//               {editing ? "Update" : "Create"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default VocabularyManagement;
