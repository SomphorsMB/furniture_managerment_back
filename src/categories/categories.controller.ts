import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpException, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/authorization/role.guard';
import { Roles } from 'src/authorization/role.decorator';
import { Role } from 'src/authorization/role.enum';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @Res() res:Response) {
    const isCategoryExist = await this.categoriesService.checkCategory(createCategoryDto.name);
    if(isCategoryExist) {
      return res.status(409).json({message:'Category already exist!'});
    }else {
      this.categoriesService.create(createCategoryDto).then(() =>{
        return res.status(201).json({message:'Category created successfully!'});
      }).catch(error=>{
          return res.status(500).json({
                  message:'Something went wrong!',
                  post:error});
      });
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.SELLER)
  @Get()
  findAllCategory(@Res() res:Response) {
    this.categoriesService.findAll().then(result=>{
      return res.status(200).json(result);
    }).catch(error=>{
      return res.status(500).json(error);
    })
  }

  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.SELLER)
  @Get(':id')
  findOneCategory(@Param('id',ParseIntPipe) id: string,@Res() res:Response) {
    this.categoriesService.findOne(+id).then(result =>{
      if(result){
        return res.status(200).json({result});
      }else{
        return res.status(404).json({message:'Category not found!'});
      }
    }).catch(error=>{
      res.status(500).json({message:'Something went wrong!',error:error});
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  @Patch(':id')
  async updateCategory(@Param('id',ParseIntPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto,@Res() res:Response) {
    const isCategoryExist = await this.categoriesService.checkCategory(updateCategoryDto.name);
    this.categoriesService.findOne(+id).then(result=>{
      if(result){
        if(isCategoryExist){
          return res.status(409).json({message:'Category already exist!'});
        }else{
          this.categoriesService.update(+id,updateCategoryDto).then(category=>{
            return res.status(201).json({message:'Updated category successfully!'});
          }).catch(error=>{
            return res.status(500).json({
              message:'Something went wrong!',
              error:error
            });
          });
        }
      }else{
        return res.status(404).json({message:'category not found!'});
      }
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  @Delete(':id')
  removeCategory(@Param('id',ParseIntPipe) id: string,@Res() res:Response) {
    this.categoriesService.findOne(+id).then(result=>{
      if(result){
        this.categoriesService.remove(+id).then(()=>{
          return res.status(201).json({message:'Deleted category successfully!'});
        }).catch(error=>{
          return res.status(500).json({
            message:'Something went wrong!',
            error:error
          });
        });
      }else{
        return res.status(404).json({message:'category not found!'});
      }
    });
  }
}
